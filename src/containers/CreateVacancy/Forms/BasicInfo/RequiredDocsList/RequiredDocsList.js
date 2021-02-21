import { PlusOutlined } from '@ant-design/icons';
import { Form, Button } from 'antd';

import InputWithCheckbox from '../../../../../components/UI/InputWithCheckbox/InputWithCheckbox';

const requiredDocsList = (props) => {
	return (
		<Form.List name={props.name}>
			{(fields, { add, remove }) => {
				return (
					<div>
						{fields.map((field, index) => (
							<div key={field.key}>
								<Form.Item name={[index, 'name']} rules={[{ required: true }]}>
									<InputWithCheckbox
										name={[index, 'document']}
										checkboxName={[index, 'isDocumentOptional']}
										rules={[{ required: true }]}
										onInnerButtonClick={() => remove(field.name)}
									/>
								</Form.Item>
							</div>
						))}
						<Form.Item>
							<Button type='secondary' onClick={() => add()}>
								<PlusOutlined /> add more
							</Button>
						</Form.Item>
					</div>
				);
			}}
		</Form.List>
	);
};

export default requiredDocsList;
