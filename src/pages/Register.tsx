// ./src/pages/Register.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LeanCloudError } from '../services/authService';
import { Input, Form, Button, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState<string>('');
  const [retypePassword, setRetypePassword] = useState<string>('');
  const [message, setMessage] = useState('');
  const { register } = useContext(AuthContext);
  // const navigate = useNavigate(); // Optionally navigate after registration

  const handleSubmit = async (values: { email: string; password: string; retypePassword: string }) => {
    setMessage('');
    if (values.password !== values.retypePassword) {
      setMessage('Passwords do not match!');
      return;
    }
    try {
      await register(values.email, values.password);
      setMessage('Registration successful. Please check your email for verification.');
      // Optionally navigate to login page
      // navigate('/login');
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      setMessage(leanCloudError.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <Title level={2} className="text-center mb-6">
        Register
      </Title>
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your Email!' },
            { type: 'email', message: 'Please enter a valid Email!' },
          ]}
        >
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
          hasFeedback
        >
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          label="Retype Password"
          name="retypePassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please retype your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Retype Password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
      {message && (
        <Text type="danger" className="text-center">
          {message}
        </Text>
      )}
    </div>
  );
};

export default Register;