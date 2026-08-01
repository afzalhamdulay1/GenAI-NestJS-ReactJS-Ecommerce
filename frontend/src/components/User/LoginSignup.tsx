import React, { Fragment, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import FaceIcon from '@mui/icons-material/Face';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { clearErrors, loginUser, registerUser } from '@/features/user/userSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toast } from 'react-toastify';
import dummyProfile from '@/images/Profile.png';
import FormInput from '@/components/Form/FormInput';
import { compressImage } from '@/utils/imageCompressor';

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

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const compressedBase64 = await compressImage(files[0]);
        setAvatarPreview(compressedBase64);
        setAvatar(compressedBase64);
      } catch (err) {
        toast.error("Failed to process profile avatar image");
      }
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  return (
    <Fragment>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all">
          {/* Admin Info */}
          <div className="bg-blue-50/50 p-4 text-center border-b border-blue-100">
            <h2 className="text-xs text-blue-800 font-medium mb-1">
              Admin Test Credentials
            </h2>
            <div className="flex justify-center gap-4 text-xs font-mono">
              <span className="text-blue-600">afzal@gmail.com</span>
              <span className="text-blue-600">12345678</span>
            </div>
          </div>

          <div className="p-8">
            {/* Tabs */}
            <div className="flex mb-8 bg-gray-100/80 p-1 rounded-xl relative">
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${activeTab === 'login' ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'}`}
              />
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold text-center z-10 transition-colors duration-200 ${activeTab === 'login' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold text-center z-10 transition-colors duration-200 ${activeTab === 'register' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            <div className="relative overflow-hidden w-full">
              {/* Login Form */}
              <div className={`w-full transition-all duration-500 ease-in-out ${activeTab === 'login' ? 'relative opacity-100 translate-x-0' : 'absolute top-0 opacity-0 -translate-x-full pointer-events-none'}`}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                  <p className="text-sm text-gray-500 mt-1">Please enter your details to sign in</p>
                </div>
                
                <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit(onLoginSubmit)}>
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

                  <div className="flex justify-end">
                    <Link to="/password/forgot" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold shadow-md shadow-rose-500/20 hover:bg-rose-600 hover:shadow-rose-500/30 transition-all duration-200 mt-2"
                  >
                    Sign In
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.012c1.49 0 2.89.55 3.98 1.485l3.078-3.078C19.195 3.195 16.74 2 13.99 2A10.5 10.5 0 0 0 3.5 12.5a10.5 10.5 0 0 0 10.49 10.5c5.782 0 10.51-4.728 10.51-10.5 0-.712-.06-1.4-.177-2.065l-12.083-.15Z" />
                    </svg>
                    Google
                  </button>
                </form>
              </div>

              {/* Register Form */}
              <div className={`w-full transition-all duration-500 ease-in-out ${activeTab === 'register' ? 'relative opacity-100 translate-x-0' : 'absolute top-0 opacity-0 translate-x-full pointer-events-none'}`}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
                  <p className="text-sm text-gray-500 mt-1">Join us to start shopping</p>
                </div>
                
                <form className="flex flex-col gap-4" encType="multipart/form-data" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
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

                  <div className="mt-2 relative">
                    <input
                      id="avatarFileInputRegister"
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="avatarFileInputRegister"
                      className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-rose-50 hover:border-rose-200 cursor-pointer transition-colors group"
                    >
                      <img 
                        src={avatarPreview} 
                        alt="Avatar Preview" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-rose-500 transition-colors">
                          Choose Profile Photo
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          JPG, PNG or GIF · Max 2MB
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-md shadow-gray-900/20 hover:bg-gray-800 hover:shadow-gray-900/30 transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginSignup;
