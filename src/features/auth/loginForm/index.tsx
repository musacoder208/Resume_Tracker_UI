import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../api/auth.api';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setAuthContext } from '../redux/auth.slice';
import { useT } from '@/i18n/useT';
import { Input, PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/form/FormErrorBanner';
import { IMAGES } from '@/icons/images';
import { setActiveSession } from '@/utils/authSession';

// Schema at module level — type derived so they never diverge.
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const { t } = useT('auth');

  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      const data = await login({ username: values.username, password: values.password }).unwrap();
      setActiveSession();
      dispatch(setAuthContext(data));
      await navigate('/dashboard', { replace: true });
    } catch {
      // error surfaced via RTK Query `error` state
    }
  };

  const apiError = error ? t('login.errors.invalidCredentials') : undefined;

  return (
    <div className="w-full max-w-md">

      {/* Logo + app name */}
      <div className="mb-8 flex items-center justify-center">
        <img src={IMAGES.logo} alt="Resume Tracker" className="h-10 w-auto" />
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-surface px-8 py-10 shadow-lg">

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-text-muted">{t('login.subtitle')}</p>
        </div>

        <form
          onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}
          className="space-y-4"
        >
          <FormErrorBanner message={apiError} />

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text">
              {t('login.form.labels.username')}
              <span className="ms-0.5 text-error">*</span>
            </label>
            <Input
              {...register('username')}
              placeholder={t('login.form.placeholders.username')}
              variant={formState.errors.username ? 'error' : 'default'}
              autoComplete="username"
            />
            {formState.errors.username && (
              <p className="mt-1 text-xs text-error">{t('login.errors.usernameRequired')}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text">
              {t('login.form.labels.password')}
              <span className="ms-0.5 text-error">*</span>
            </label>
            <PasswordInput
              {...register('password')}
              placeholder={t('login.form.placeholders.password')}
              hasError={Boolean(formState.errors.password)}
              autoComplete="current-password"
            />
            {formState.errors.password && (
              <p className="mt-1 text-xs text-error">{t('login.errors.passwordRequired')}</p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? t('login.buttons.signingIn') : t('login.buttons.signIn')}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-text-muted">{t('login.footer', { year: new Date().getFullYear() })}</p>

    </div>
  );
}
