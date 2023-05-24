import { useState, useContext } from 'react';
import { Typography } from 'antd';
const { Paragraph, Title } = Typography;
import ProfileContext from '../../Util/FormContext';
import EditableBasicInfo from '../../Forms/EditableBasicInfo/EditableBasicInfo';

const BasicInfoTab = () => {

    const [basicOpen, setBasicOpen] = useState(false);
    const contextValue = useContext(ProfileContext);
    const { profile, hasProfile } = contextValue;
    const { basicInfo } = profile;
	const address = basicInfo?.address;

	const getFullNumber = (prefix, number) => {
		const areaCode = number.slice(0, 3);
		const firstHalf = number.slice(3, 6);
		const secondHalf = number.slice(6);
		return `${prefix} (${areaCode}) ${firstHalf} - ${secondHalf}`;
	};

    return(
        <div>
            {!hasProfile || basicOpen ? (
                <EditableBasicInfo setBasicOpen={setBasicOpen} />
            ) : (
                <>
                    <div style={{ marginBottom: '25px' }}>
                        <div style={{ marginBottom: 15 }}>
                            <a onClick={() => setBasicOpen(true)}>Edit</a>
                        </div>
                        <Title level={5} style={{ fontSize: '16px', color: '#6a6a6a' }}>
                            Address
                        </Title>
                        <Paragraph style={{ color: '#363636' }}>
                            {address.address2 === '' || address.address2 === undefined
                                ? address.address
                                : address.address + ' ' + address.address2}
                            <br />
                            {`${address.city}, ${address.stateProvince} ${address.zip}`}
                            <br />
                            {address.country}
                        </Paragraph>
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <Title level={5} style={{ fontSize: '16px', color: '#6a6a6a' }}>
                            Email
                        </Title>
                        <Paragraph style={{ color: '#363636' }}>
                            {basicInfo.email}
                        </Paragraph>
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <Title level={5} style={{ fontSize: '16px', color: '#6a6a6a' }}>
                            Mobile
                        </Title>
                        <Paragraph style={{ color: '#363636' }}>
                            {getFullNumber(basicInfo.phonePrefix, basicInfo.phone)}
                        </Paragraph>
                    </div>
                </>
            )}
        </div>
    );
};
export default BasicInfoTab;