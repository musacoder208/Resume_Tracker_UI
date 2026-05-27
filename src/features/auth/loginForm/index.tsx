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
import { Checkbox } from '@/components/ui/checkbox';
import { FormErrorBanner } from '@/components/form/FormErrorBanner';
import { LockClosedIcon } from '@/icons';
import { IMAGES } from '@/icons/images';
import { setActiveSession } from '@/utils/authSession';

// Schema at module level — no i18n dependency.
// Type is derived from the schema so they can never diverge.
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
      {/* Logo + heading */}
      <div className="mb-7 flex flex-col items-center gap-y-5 text-center">
        <img src={IMAGES.logo} alt="Resume Tracker" className="h-13 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-text">{t('login.title')}</h1>
          <p className="mt-2 text-sm font-medium text-primary-hover">{t('login.subtitle')}</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="space-y-3.5"
      >
        <FormErrorBanner message={apiError} />

        {/* Username field */}
        <div>
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

        {/* Password field */}
        <div>
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

        <div className="flex items-center justify-between pt-0.5">
          <Checkbox {...register('rememberMe')} label={t('login.form.labels.rememberMe')} />
          <a href="#" className="text-[12.5px] font-semibold text-primary-hover hover:underline">
            {t('login.form.actions.forgotPassword')}
          </a>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            leadingIcon={<LockClosedIcon className="h-[15px] w-[15px]" />}
          >
            {isLoading ? t('login.buttons.signingIn') : t('login.buttons.signIn')}
          </Button>
        </div>
      </form>
    </div>
  );
}
