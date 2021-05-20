import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MANAGE_VACANCY } from '../../constants/Routes.js';
import { GET_COMMITTEE_MEMBER_VIEW } from '../../constants/ApiEndpoints';
import { Table } from 'antd';
// import './CommitteeDashboard.css';
import axios from 'axios';

const renderDecision = (text) =>
	text == 'Pending' ? (
		<span style={{ color: 'rgba(0,0,0,0.25)', textTransform: 'capitalize' }}>
			{text}
		</span>
	) : (
		<span style={{ textTransform: 'capitalize' }}>{text}</span>
	);

const committeeDashboard = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				// for local development
				const username = 'apptrack.committee_member';
				const password = process.env.REACT_APP_PASSWORD;
				axios.defaults.auth = {
					username,
					password,
				};
				const currentData = await axios.get(GET_COMMITTEE_MEMBER_VIEW);
				debugger;
				console.log(currentData);
				setData(currentData.data.result);
			} catch (err) {
				console.warn(err);
			}

			setIsLoading(false);
		})();
	}, []);

	return isLoading ? (
		<> </>
	) : (
		<>
			<div className='HeaderTitle'>
				<h1>Vacancies Assigned To You</h1>
			</div>
			<div className='CommitteeDashboard'>
				<Table
					rowKey={(record) => record.vacancy_id}
					dataSource={data}
					columns={committeeColumns}
					key='CommitteeVacancies'
				></Table>
			</div>
		</>
	);
};

const committeeColumns = [
	{
		title: 'Vacancy Title',
		dataIndex: 'vacancy_title',
		key: 'title',
		// sorter: {
		// 	compare: (a, b) => a.vacancy_title.localeCompare(b.vacancy_title),
		// 	multiple: 1,
		// },
		defaultSortOrder: 'ascend',
		// render: (title, record) => (
		//  <Link to={'/manage/vacancy/' + record.vacancy_id}>{title}</Link>
		// ),
	},
	{
		title: 'Applicants',
		dataIndex: 'applicants',
		key: 'applicants',
		render: (number, record) => (
			<Link to={MANAGE_VACANCY + record.vacancy_id + '/applicants'}>
				{number} {number == 1 ? 'applicant' : 'applicants'}
			</Link>
		),
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		// sorter: {
		// 	compare: (a, b) => a.status.localeCompare(b.status),
		// 	multiple: 2,
		// },
		defaultSortOrder: 'ascend',
		// render: (status) => {
		// 	// 	if (status.includes('owm')) {
		// 	// 		status = status.split('_')[0].toUpperCase() + status.substring(3);
		// 	// 	}
		// 	if (status.includes('_')) {
		// 		status = status
		// 			.split('_')
		// 			.map((word) => word[0].toUpperCase() + word.substring(1))
		// 			.join(' ');
		// 		return <span style={{ color: 'rgb(86,86,86)' }}>{status}</span>;
		// 	}
		// },
		// else {
		// 		return (
		// 			<span style={{ color: 'rgb(86,86,86)' }}>
		// 				{status.charAt(0).toUpperCase() + status.slice(1)}
		// 			</span>
		// 		);
		// 	}
		// },
	},
	{
		title: 'Your Scoring',
		dataIndex: 'your_scoring',
		key: 'scoring',
		render: (text) => renderDecision(text),
	},
];

export default committeeDashboard;
