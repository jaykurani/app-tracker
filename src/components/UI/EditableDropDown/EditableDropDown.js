import './EditableDropDown.css';
import Select from 'react-select'
import { Button, Menu, Dropdown, Space, Icon, Form } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const editableDropDown = (props) => (
	<Form.Item label={props.label} >
		{/* <span style={props.labelStyle}>{props.label}</span><br/> */}
		<Dropdown overlay={props.menu} trigger={['click']} >
			<a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
				Click me
				{/* <Icon type="down" /> */}
				<DownOutlined />
			</a>
		</Dropdown>
	</Form.Item>
);

export default editableDropDown;
