import { useEffect, useState } from 'react';
import { message, Table, Collapse } from 'antd';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import IndividualScoringTable from './IndividualScoringTable/IndividualScoringTable';
import { MANAGE_APPLICATION } from '../../../constants/Routes';
import ApplicantList from '../../CommitteeDashboard/ApplicantList/ApplicantList';
import {
	INDIVIDUAL_SCORING_IN_PROGRESS,
	COMMITTEE_REVIEW_IN_PROGRESS,
	VOTING_COMPLETE,
} from '../../../constants/VacancyStates';
import {
	OWM_TEAM,
	COMMITTEE_CHAIR,
	COMMITTEE_MEMBER_VOTING,
	COMMITTEE_MEMBER_NON_VOTING,
} from '../../../constants/Roles';
import { GET_APPLICANT_LIST } from '../../../constants/ApiEndpoints';
import { transformDateToDisplay } from '../../../components/Util/Date/Date';

import './ApplicantList.css';

const { Panel } = Collapse;

const renderDecision = (text) =>
	text == 'Pending' ? (
		<span style={{ color: 'rgba(0,0,0,0.25)', textTransform: 'capitalize' }}>
			{text}
		</span>
	) : (
		<span style={{ textTransform: 'capitalize' }}>{text}</span>
	);

const defaultApplicantSort = 'ascend';
const applicantColumns = [
	{
		title: 'Applicant',
		dataIndex: 'applicant_last_name',
		key: 'name',
		render: (text, record) => {
			return (
				<Link to={MANAGE_APPLICATION + record.sys_id}>
					{text}, {record.applicant_first_name}
				</Link>
			);
		},
		width: 250,
		defaultSortOrder: defaultApplicantSort,
		sorter: true,
	},
	{
		title: 'Email',
		dataIndex: 'applicant_email',
		key: 'email',
		maxWidth: 250,
	},
	{
		title: 'Submitted',
		dataIndex: 'submitted',
		key: 'submitted',
		render: (date) => transformDateToDisplay(date),
	},
	{
		title: 'Vacancy Manager Triage Decision',
		dataIndex: 'owm_triage_status',
		key: 'OWMStatus',
		render: (text) => renderDecision(text),
	},

	{
		title: 'Chair Triage Decision',
		dataIndex: 'chair_triage_status',
		key: 'ChairStatus',
		render: (text) => renderDecision(text),
	},
];

const applicantList = (props) => {
	const { sysId } = useParams();
	const [applicants, setApplicants] = useState([]);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [tableLoading, setTableLoading] = useState(false);

	const [recommendedApplicants, setRecommendedApplicants] = useState([]);
	const [recommendedApplicantsPageSize, setRecommendedApplicantsPageSize] =
		useState(10);
	const [recommendedApplicantsTotalCount, setRecommendedApplicantsTotalCount] =
		useState(0);
	const [
		recommendedApplicantsTableLoading,
		setRecommendedApplicantsTableLoading,
	] = useState([]);

	const [nonRecommendedApplicants, setNonRecommendedApplicants] = useState([]);
	const [
		nonRecommendedApplicantsPageSize,
		setNonRecommendedApplicantsPageSize,
	] = useState(10);
	const [
		nonRecommendedApplicantsTotalCount,
		setNonRecommendedApplicantsTotalCount,
	] = useState(0);
	const [
		nonRecommendedApplicantsTableLoading,
		setNonRecommendedApplicantsTableLoading,
	] = useState([]);

	const pageSizeOptions = [10, 25];

	const tablePagination = {
		pageSizeOptions: pageSizeOptions,
		pageSize: pageSize,
		total: totalCount,
		hideOnSinglePage: true,
	};

	const recommendedApplicantsTablePagination = {
		pageSizeOptions: pageSizeOptions,
		pageSize: recommendedApplicantsPageSize,
		total: recommendedApplicantsTotalCount,
		hideOnSinglePage: true,
	};

	const nonRecommendedApplicantsTablePagination = {
		pageSizeOptions: pageSizeOptions,
		pageSize: nonRecommendedApplicantsPageSize,
		total: nonRecommendedApplicantsTotalCount,
		hideOnSinglePage: true,
	};

	useEffect(() => {
		updateData(1, pageSize, defaultApplicantSort);
	}, [props.vacancyState]);

	const loadRecommendedApplicants = async (page, pageSize, orderBy) => {
		setRecommendedApplicantsTableLoading(true);
		const data = await loadApplicants(page, pageSize, orderBy, 'yes');
		setRecommendedApplicantsTableLoading(false);
		setRecommendedApplicants(data.applicants);
		setRecommendedApplicantsTotalCount(data.totalCount);
		setRecommendedApplicantsPageSize(data.pageSize);
	};

	const loadNonRecommendedApplicants = async (page, pageSize, orderBy) => {
		setNonRecommendedApplicantsTableLoading(true);
		const data = await loadApplicants(page, pageSize, orderBy, 'no');
		setNonRecommendedApplicantsTableLoading(false);
		setNonRecommendedApplicants(data.applicants);
		setNonRecommendedApplicantsTotalCount(data.totalCount);
		setNonRecommendedApplicantsPageSize(data.pageSize);
	};

	const loadAllApplicants = async (page, pageSize, orderBy) => {
		setTableLoading(true);
		const data = await loadApplicants(page, pageSize, orderBy);
		setTableLoading(false);
		setApplicants(data.applicants);
		setTotalCount(data.totalCount);
		setPageSize(data.pageSize);
	};

	const updateData = async (page, pageSize, orderBy) => {
		if (
			props.userRoles.includes(OWM_TEAM) &&
			(props.vacancyState === INDIVIDUAL_SCORING_IN_PROGRESS ||
				props.vacancyState === VOTING_COMPLETE ||
				props.vacancyState === COMMITTEE_REVIEW_IN_PROGRESS)
		) {
			loadRecommendedApplicants(1, recommendedApplicantsPageSize, orderBy);
			loadNonRecommendedApplicants(
				1,
				nonRecommendedApplicantsPageSize,
				orderBy
			);
		} else {
			loadAllApplicants(1, pageSize, orderBy);
		}
	};

	const getTable = (vacancyState, userRoles, userCommitteeRole) => {
		const table = (
			<Table
				dataSource={applicants}
				columns={applicantColumns}
				scroll={{ x: 'true' }}
				rowKey='sys_id'
				pagination={tablePagination}
				loading={tableLoading}
				onChange={(pagination, _, sorter) => {
					loadAllApplicants(
						pagination.current,
						pagination.pageSize,
						sorter.order
					);
				}}
			></Table>
		);

		if (userRoles.includes(OWM_TEAM)) {
			switch (vacancyState) {
				case INDIVIDUAL_SCORING_IN_PROGRESS:
					return (
						<Collapse defaultActiveKey={['0']} ghost>
							<Panel header='Recommended Applicants'>
								<IndividualScoringTable
									applicants={recommendedApplicants}
									pagination={recommendedApplicantsTablePagination}
									loading={recommendedApplicantsTableLoading}
									onTableChange={loadRecommendedApplicants}
								/>
							</Panel>
							<Panel header='Non-Recommended Applicants'>
								<IndividualScoringTable
									applicants={nonRecommendedApplicants}
									pagination={nonRecommendedApplicantsTablePagination}
									loading={nonRecommendedApplicantsTableLoading}
									onTableChange={loadNonRecommendedApplicants}
								/>
							</Panel>
						</Collapse>
					);
				case VOTING_COMPLETE:
				case COMMITTEE_REVIEW_IN_PROGRESS:
					return (
						<Collapse defaultActiveKey={['0']} ghost>
							<Panel header='Recommended Applicants'>
								<IndividualScoringTable
									applicants={recommendedApplicants}
									pagination={recommendedApplicantsTablePagination}
									loading={recommendedApplicantsTableLoading}
									onTableChange={loadRecommendedApplicants}
									committeeVoting={true}
									postChangeHandler={loadVacancyAndApplicants}
									displayAllComments={vacancyState === VOTING_COMPLETE}
									vacancyState={vacancyState}
								/>
							</Panel>
							<Panel header='Non-Recommended Applicants'>
								<IndividualScoringTable
									applicants={nonRecommendedApplicants}
									pagination={nonRecommendedApplicantsTablePagination}
									loading={nonRecommendedApplicantsTableLoading}
									onTableChange={loadNonRecommendedApplicants}
									committeeVoting={true}
									postChangeHandler={loadVacancyAndApplicants}
									displayAllComments={vacancyState === VOTING_COMPLETE}
									vacancyState={vacancyState}
								/>
							</Panel>
						</Collapse>
					);
				default:
					return table;
			}
		} else if (userCommitteeRole === COMMITTEE_CHAIR) {
			switch (vacancyState) {
				case INDIVIDUAL_SCORING_IN_PROGRESS:
					return (
						<IndividualScoringTable
							applicants={applicants}
							pagination={tablePagination}
							onTableChange={loadAllApplicants}
							loading={tableLoading}
						/>
					);
				case VOTING_COMPLETE:
				case COMMITTEE_REVIEW_IN_PROGRESS:
					return (
						<IndividualScoringTable
							applicants={applicants}
							pagination={tablePagination}
							onTableChange={loadAllApplicants}
							committeeVoting={true}
							postChangeHandler={loadVacancyAndApplicants}
							displayAllComments={vacancyState === VOTING_COMPLETE}
							loading={tableLoading}
						/>
					);
				default:
					return table;
			}
		} else if (
			userCommitteeRole === COMMITTEE_MEMBER_VOTING ||
			userCommitteeRole === COMMITTEE_MEMBER_NON_VOTING
		) {
			return (
				<ApplicantList
					applicants={applicants}
					pagination={tablePagination}
					onTableChange={loadAllApplicants}
					loading={tableLoading}
				/>
			);
		} else {
			return table;
		}
	};

	const loadApplicants = async (page, pageSize, orderBy, recommended) => {
		const offset = page;
		const limit = pageSize;
		try {
			let apiString =
				GET_APPLICANT_LIST +
				sysId +
				'?offset=' +
				offset +
				'&limit=' +
				limit +
				'&orderBy=' +
				orderBy;

			if (recommended) apiString += '&recommended=' + recommended;

			const response = await axios.get(apiString);
			return {
				applicants: response.data.result.applicants,
				totalCount: response.data.result.totalCount,
				pageSize: pageSize,
			};
		} catch (error) {
			message.error(
				'Sorry!  An error occurred while loading the page.  Try reloading.'
			);
		}
	};

	const loadVacancyAndApplicants = () => {
		updateData(1, pageSize, defaultApplicantSort);
		props.reloadVacancy();
	};

	const table = getTable(
		props.vacancyState,
		props.userRoles,
		props.userCommitteeRole
	);

	return <div className='applicant-table'>{table}</div>;
};

export default applicantList;
