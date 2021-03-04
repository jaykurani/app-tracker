import { useState } from 'react';
import { useHistory } from 'react-router';
import { Steps, Button, Form, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import BasicInfo from './Forms/BasicInfo/BasicInfo';
import MandatoryStatements from './Forms/MandatoryStatements/MandatoryStatements';
import VacancyCommittee from './Forms/VacancyCommittee/VacancyCommittee';
import EmailTemplates from './Forms/EmailTemplates/EmailTemplates';
import FinalizeVacancy from './Forms/FinalizeVacancy/FinalizeVacancy';
import { initialValues } from './Forms/FormsInitialValues';
import './CreateVacancy.css';

const createVacancy = () => {
	const { Step } = Steps;
	const history = useHistory();
	const [errorSections, setErrorSections] = useState([]);
	const [allForms, setAllForms] = useState(initialValues);

	const printState = () => {
		console.log('[printState]: allForms ' + JSON.stringify(allForms, null, 2));
	};

	const updateCommitteeMembers = (committeeMembers) => {
		setAllForms({ ...allForms, vacancyCommittee: committeeMembers });
	};

	const updateBasicInfo = (newBasicInfo) => {
		setAllForms({ ...allForms, basicInfo: newBasicInfo });
	};

	const [basicInfoForm] = Form.useForm();
	const [mandatoryStatementsForm] = Form.useForm();
	const [vacancyCommitteeForm] = Form.useForm();
	const [emailTemplatesForm] = Form.useForm();

	const isFormValid = async () => {
		const errorForms = [];
		try {
			await basicInfoForm.validateFields();
		} catch (error) {
			errorForms.push('Basic Vacancy Information');
		}

		try {
			await mandatoryStatementsForm.validateFields();
		} catch (error) {
			errorForms.push('Mandatory Statements');
		}

		try {
			await vacancyCommitteeForm.validateFields();
		} catch (error) {
			errorForms.push('Vacancy Committee');
		}

		try {
			await emailTemplatesForm.validateFields();
		} catch (error) {
			errorForms.push('Email Templates');
		}
		setErrorSections(errorForms);
	};

	const steps = [
		{
			step: 1,
			title: 'Basic Vacancy Information',
			description: 'Fill in vacancy information',
			content: (
				<BasicInfo
					initialValues={allForms.basicInfo}
					setBasicInfo={updateBasicInfo}
					formInstance={basicInfoForm}
				/>
			),
		},
		{
			step: 2,
			title: 'Mandatory Statements',
			description:
				'Select pre-written mandatory statements to add to the posting',
			content: (
				<MandatoryStatements
					initialValues={allForms.mandatoryStatements}
					formInstance={mandatoryStatementsForm}
				/>
			),
		},
		{
			step: 3,
			title: 'Vacancy Committee',
			description: 'Add and manage vacancy committee members',
			content: (
				<VacancyCommittee
					committeeMembers={allForms.committeeMembers}
					setCommitteeMembers={updateCommitteeMembers}
					formInstance={vacancyCommitteeForm}
				/>
			),
		},
		{
			step: 4,
			title: 'Email Templates',
			description: 'Choose the emails to send applicants and manage email body',
			content: (
				<EmailTemplates
					initialValues={allForms.emailTemplates}
					formInstance={emailTemplatesForm}
				/>
			),
		},
		{
			step: 5,
			title: 'Review and Finalize',
			description: '',
			content: (
				<FinalizeVacancy
					allForms={allForms}
					onEditButtonClick={(number) => stepClickHandler(number)}
				/>
			),
		},
	];

	const [currentStep, setCurrentStep] = useState(0);

	const next = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			isFormValid();
		}
	};

	const prev = () => {
		currentStep === 0 ? history.goBack() : setCurrentStep(currentStep - 1);
	};

	const currentStepObject = steps[currentStep] || {};

	const stepClickHandler = (current) => {
		setCurrentStep(current);
	};

	const wizardFormChangeHandler = (name, forms) => {
		if (name === 'MandatoryStatements') {
			const { MandatoryStatements } = forms;
			const newMandatoryStatements = MandatoryStatements.getFieldsValue();
			setAllForms({
				...allForms,
				mandatoryStatements: newMandatoryStatements,
			});
		}

		// For some currently unknown reason, EmailTemplates is firing off the onChange handler on render
		if (name === 'EmailTemplates') {
			const { EmailTemplates } = forms;
			if (EmailTemplates) {
				const newEmailTemplates = EmailTemplates.getFieldsValue();
				setAllForms({
					...allForms,
					emailTemplates: newEmailTemplates.emailTemplates,
				});
			}
		}
	};

	return (
		<>
			<Form.Provider
				onFormChange={(name, { forms, changedFields }) => {
					wizardFormChangeHandler(name, forms, changedFields);
				}}
			>
				<div className='CreateVacancyContainer'>
					<div className='StepNavigation'>
						<Steps
							current={currentStep}
							direction='vertical'
							onChange={stepClickHandler}
						>
							{steps.map((item) => (
								<Step
									key={item.title}
									title={item.title}
									description={item.description}
								/>
							))}
						</Steps>
					</div>
					<div className='StepContentContainer'>
						<div className='StepContent'>
							<h3>{currentStepObject.title}</h3>
							<p>{currentStepObject.description}</p>
							{steps.map((item) => (
								<div
									key={item.step}
									className={`${item.step !== currentStep + 1 && 'Hidden'}`}
								>
									{item.content}
								</div>
							))}
						</div>
						<div className='steps-action'>
							<Button
								onClick={prev}
								type='primary'
								ghost
								className='wider-button'
							>
								{currentStep === 0 ? 'cancel' : 'back'}
							</Button>
							{currentStep < steps.length - 1 ? (
								<Button type='text' disabled icon={<ReloadOutlined />}>
									Clear Form
								</Button>
							) : null}

							<Button type='primary' onClick={next} className='wider-button'>
								{currentStep == steps.length - 1 ? 'Save and Finalize' : 'save'}
							</Button>
						</div>
						<div
							className='ErrorPanel'
							style={
								errorSections.length === 0 || currentStep < steps.length - 1
									? { display: 'none' }
									: null
							}
						>
							<p>
								{
									"Sorry, we can't submit just yet.  The following sections have fields that need to change or have values: "
								}
							</p>
							<ul>
								{errorSections.map((section, index) => (
									<li key={index}>{section}</li>
								))}
							</ul>
							<p>
								{
									"We've highlighted those fields in red.  Please return to those sections and address the highlights, then return here and click 'Save and Finalize' again."
								}
							</p>
						</div>
					</div>
				</div>
			</Form.Provider>
			{/* <Button type='primary' onClick={printState}>
				Print State
			</Button> */}
			<Modal></Modal>
		</>
	);
};

export default createVacancy;
