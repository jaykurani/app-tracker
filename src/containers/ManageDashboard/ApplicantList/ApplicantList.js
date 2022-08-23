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
		sorter: {
			compare: (a, b) =>
				a.applicant_last_name.localeCompare(b.applicant_last_name),
			multiple: 1,
		},
		width: 250,
		defaultSortOrder: 'ascend',
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

	useEffect(() => {
		loadApplicants();
	}, [props.vacancyState]);

	const getTable = (vacancyState, applicants, userRoles, userCommitteeRole) => {
		const recommendedApplicants = applicants.filter(
			(applicant) => applicant.chair_triage_status === 'yes'
		);
		const nonRecommendedApplicants = applicants.filter(
			(applicant) => applicant.chair_triage_status !== 'yes'
		);

		if (userRoles.includes(OWM_TEAM)) {
			switch (vacancyState) {
				case INDIVIDUAL_SCORING_IN_PROGRESS:
					return (
						<Collapse defaultActiveKey={['0']} ghost>
							<Panel header='Recommended Applicants'>
								<IndividualScoringTable applicants={recommendedApplicants} />
							</Panel>
							<Panel header='Non-Recommended Applicants'>
								<IndividualScoringTable applicants={nonRecommendedApplicants} />
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
									committeeVoting={true}
									postChangeHandler={loadVacancyAndApplicants}
									displayAllComments={vacancyState === VOTING_COMPLETE}
								/>
							</Panel>
							<Panel header='Non-Recommended Applicants'>
								<IndividualScoringTable
									applicants={nonRecommendedApplicants}
									committeeVoting={true}
									postChangeHandler={loadVacancyAndApplicants}
									displayAllComments={vacancyState === VOTING_COMPLETE}
								/>
							</Panel>
						</Collapse>
					);
				default:
					return (
						<Table
							dataSource={applicants}
							columns={applicantColumns}
							scroll={{ x: 'true' }}
							rowKey='sys_id'
						></Table>
					);
			}
		} else if (userCommitteeRole === COMMITTEE_CHAIR) {
			switch (vacancyState) {
				case INDIVIDUAL_SCORING_IN_PROGRESS:
					return <IndividualScoringTable applicants={applicants} />;
				case VOTING_COMPLETE:
				case COMMITTEE_REVIEW_IN_PROGRESS:
					return (
						<IndividualScoringTable
							applicants={applicants}
							committeeVoting={true}
							postChangeHandler={loadVacancyAndApplicants}
							displayAllComments={vacancyState === VOTING_COMPLETE}
						/>
					);
				default:
					return (
						<Table
							dataSource={applicants}
							columns={applicantColumns}
							scroll={{ x: 'true' }}
							rowKey='sys_id'
						></Table>
					);
			}
		} else if (
			userCommitteeRole === COMMITTEE_MEMBER_VOTING ||
			COMMITTEE_MEMBER_NON_VOTING
		) {
			return <ApplicantList applicants={applicants} />;
		} else {
			return (
				<Table
					dataSource={applicants}
					columns={applicantColumns}
					scroll={{ x: 'true' }}
					rowKey='sys_id'
				></Table>
			);
		}
	};

	const loadApplicants = async () => {
		try {
			const response = await axios.get(
				'/api/x_g_nci_app_tracke/vacancy/get_applicant_list/' + sysId
			);
			setApplicants(response.data.result);
		} catch (error) {
			message.error(
				'Sorry!  An error occurred while loading the page.  Try reloading.'
			);
		}
	};

	const loadVacancyAndApplicants = () => {
		loadApplicants();
		props.reloadVacancy();
	};

	const table = getTable(
		props.vacancyState,
		applicants,
		props.userRoles,
		props.userCommitteeRole
	);

	return <div className='applicant-table'>{table}</div>;
};

export default applicantList;
