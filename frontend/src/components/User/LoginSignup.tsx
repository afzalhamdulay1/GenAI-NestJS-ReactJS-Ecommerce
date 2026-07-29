import React, { Fragment, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import '@/components/User/LoginSignup.css';
import Loader from '@/components/Layout/Loader/Loader';
import { Link, useNavigate } from 'react-router-dom';
import FaceIcon from '@mui/icons-material/Face';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
  clearErrors,
  loginUser,
  registerUser,
} from '@/features/user/userSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toast } from 'react-toastify';
import dummyProfile from '@/images/Profile.png';
import FormInput from '@/components/Form/FormInput';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const LoginSignup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error, loading } = useAppSelector((state) => state.user);

  const loginTab = useRef<HTMLFormElement>(null);
  const registerTab = useRef<HTMLFormElement>(null);
  const switcherTab = useRef<HTMLButtonElement>(null);

  const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(dummyProfile);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    if (error) {
      toast.error(error);
    }
    dispatch(loginUser({ email: data.email, password: data.password }));
  };

  const handleGoogleLogin = () => {
    const backendUrl =
      window.location.hostname === 'localhost'
        ? 'http://localhost:4000'
        : window.location.origin;
    window.location.href = `${backendUrl}/api/v1/auth/google`;
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('email', data.email);
    formData.set('password', data.password);

    if (avatar && typeof avatar === 'string') {
      formData.set('avatar', avatar);
    }
    dispatch(registerUser(formData));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2 && reader.result) {
          setAvatarPreview(reader.result as string);
          setAvatar(reader.result);
        }
      };

      reader.readAsDataURL(files[0]);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const switchTabs = (tab: 'login' | 'register') => {
    if (!switcherTab.current || !registerTab.current || !loginTab.current)
      return;

    if (tab === 'login') {
      switcherTab.current.classList.add('shiftToNeutral');
      switcherTab.current.classList.remove('shiftToRight');

      registerTab.current.classList.remove('shiftToNeutralForm');
      loginTab.current.classList.remove('shiftToLeft');
    }
    if (tab === 'register') {
      switcherTab.current.classList.add('shiftToRight');
      switcherTab.current.classList.remove('shiftToNeutral');

      registerTab.current.classList.add('shiftToNeutralForm');
      loginTab.current.classList.add('shiftToLeft');
    }
  };

  return (
    <Fragment>
      <div className="LoginSignUpContainer">
        <div className="LoginSignUpBox">
          <div className="flex text-center items-center flex-col justify-center p-4">
            <h2 className="text-sm font-semibold">
              Use the below username and password for Admin login to test the
              dashboard features or you can register as user by clicking on
              regsiter tab/button
            </h2>
            <p className="text-green-500 text-sm">username: afzal@gmail.com</p>
            <p className="text-red-500 text-sm">password: 12345678</p>
          </div>

          <div>
            <div className="login_signUp_toggle">
              <p onClick={() => switchTabs('login')}>LOGIN</p>
              <p onClick={() => switchTabs('register')}>REGISTER</p>
            </div>
            <button ref={switcherTab}></button>
          </div>
          <form
            className="loginForm"
            ref={loginTab}
            onSubmit={handleLoginSubmit(onLoginSubmit)}
          >
            <FormInput
              icon={<MailOutlineIcon />}
              type="email"
              label="Email"
              register={registerLogin('email')}
              error={loginErrors.email}
            />

            <FormInput
              icon={<LockOpenIcon />}
              type="password"
              label="Password"
              register={registerLogin('password')}
              error={loginErrors.password}
            />

            <Link to="/password/forgot">Forget Password ?</Link>
            <input type="submit" value="Login" className="loginBtn" />
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                color: '#555',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                marginTop: '15px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f7f7f7';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ width: '20px', height: '20px' }}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.012c1.49 0 2.89.55 3.98 1.485l3.078-3.078C19.195 3.195 16.74 2 13.99 2A10.5 10.5 0 0 0 3.5 12.5a10.5 10.5 0 0 0 10.49 10.5c5.782 0 10.51-4.728 10.51-10.5 0-.712-.06-1.4-.177-2.065l-12.083-.15Z"
                />
              </svg>
              Continue with Google
            </button>
          </form>
          <form
            className="signUpForm"
            ref={registerTab}
            encType="multipart/form-data"
            onSubmit={handleRegisterSubmit(onRegisterSubmit)}
          >
            <FormInput
              icon={<FaceIcon />}
              type="text"
              label="Name"
              register={registerSignup('name')}
              error={registerErrors.name}
            />

            <FormInput
              icon={<MailOutlineIcon />}
              type="email"
              label="Email"
              register={registerSignup('email')}
              error={registerErrors.email}
            />

            <FormInput
              icon={<LockOpenIcon />}
              type="password"
              label="Password"
              register={registerSignup('password')}
              error={registerErrors.password}
            />

            <div id="registerImage">
              <img src={avatarPreview} alt="Avatar Preview" />
              <div className="registerImageInfo">
                <label htmlFor="avatarFileInputRegister">📷 Choose Photo</label>
                <p>JPG, PNG or GIF · Max 2MB</p>
              </div>
              <input
                id="avatarFileInputRegister"
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <input
              type="submit"
              value={loading ? 'Registering ' : 'Register'}
              className="signUpBtn"
            />
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginSignup;
