import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { CHECK_USER_ALREADY_APPLIED, CHECK_HAS_PROFILE } from '../../../constants/ApiEndpoints';
import {
	APPLICANT_DASHBOARD,
	APPLY,
	REGISTER_OKTA,
} from '../../../constants/Routes';
import { LIVE } from '../../../constants/VacancyStates';
import { transformDateToDisplay } from '../../../components/Util/Date/Date';
import useAuth from '../../../hooks/useAuth';
import ProfileModal from '../../../components/ProfileModal/ProfileModal';

import './Header.css';

const header = (props) => {
	const history = useHistory();

	const [userAlreadyApplied, setUserAlreadyApplied] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [hasProfile, setHasProfile] = useState(false);
	const [showProfileDialog, setShowProfileDialog] = useState(false);
	const {
		auth: { isUserLoggedIn, user },
	} = useAuth();

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			await checkUserAlreadyApplied();
			if (!user.hasProfile) {
				await checkHasProfile();
			}
			setIsLoading(false);
		})();
	}, []);

	const checkUserAlreadyApplied = async () => {
		try {
			if (isUserLoggedIn) {
				const response = await axios.get(
					CHECK_USER_ALREADY_APPLIED + props.sysId
				);
				setUserAlreadyApplied(response.data.result.exists);
			}
		} catch (error) {
			message.error('Sorry!  An error occurred while loading.');
		}
	};

	const checkHasProfile = async () => {
		try {
			const response = await axios.get(CHECK_HAS_PROFILE);
			setHasProfile(response.data.result.exists);
		} catch (e) {
			message.error('Sorry! An error occured while searching for your profile.');
		}
	}

	const onButtonClick = (link) => {
		if (!hasProfile) {
			setShowProfileDialog(true);
		}
		else if (userAlreadyApplied) {
			history.push(APPLICANT_DASHBOARD);
			message.info('You have already applied for this position.');
		} else history.push(link);
	};

	const handleProfileDialogClose = () => {
		setShowProfileDialog(false);
	}

	const isVacancyClosed = () => {
		return props.vacancyState !== LIVE;
	};

	return (
		<div className='HeaderContainer'>
			<div className='TitleAndDateContainer'>
				<h1>{props.title}</h1>
				<div className='DateContainer'>
					<div className='DateItem'>
						<label>Open Date</label>
						<span>{transformDateToDisplay(props.openDate)}</span>
					</div>
					<div className='DateItem'>
						<label>Close Date</label>
						<span>
							{transformDateToDisplay(props.closeDate) + ' 11:59PM ET'}
						</span>
					</div>
				</div>
			</div>
			{!isLoading ? (
				<div className='ButtonContainer'>
					{isVacancyClosed() ? null : isUserLoggedIn ? (
						<Button
							onClick={() => onButtonClick(APPLY + props.sysId)}
							type='primary'
						>
							Apply
						</Button>
					) : (
						<Button onClick={() => onButtonClick(REGISTER_OKTA)} type='primary'>
							Sign In and Apply
						</Button>
					)}
				</div>
			) : null}
			{showProfileDialog ? (
				<ProfileModal handleClose={() => handleProfileDialogClose()}/>
			) : null}
		</div>
	);
};

export default header;
