import { RegistrationForm } from '../components/RegistrationForm';
import { RegistrationList } from '../components/RegistrationList';
import { RegistrationDetails } from '../components/RegistrationDetails';
import { useConvocationRegistration } from '../hooks/useConvocationRegistration';
import '@/features/convocationEvents/styles/convocationEvents.css';

export default function RegistrationWorkspace() {
  const controller = useConvocationRegistration();
  return <>
    {controller.canRegister ? <>
      <RegistrationForm controller={controller} />
      <RegistrationList controller={controller} />
      <RegistrationDetails controller={controller} />
    </> : <p role="alert">Student registration is not available for your role.</p>}
  </>;
}


