import { h } from 'preact';
import { useTranslation } from 'preact-i18next';
import FormDialog from '../../components/form-dialog';
import { useState, useEffect } from 'preact/hooks';
import { usePopup } from '../../components/popup/context';
import { useFeedbackStore } from '../../store/feedback.store';
import { useAppointmentStore } from '../../store/appointment.store';
import { useOfficeStore } from '../../store/office.store';
import AOS from 'aos';

const feedbackInitialValue = {
  fullName: '',
  phone: '',
  email: '',
  comment: '',
  officeId: '',
};

const appointmentInitialValue = {
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  officeId: '',
  reason: '',
};

const Hero = () => {
  const { t } = useTranslation();
  const [openFeedback, setOpenFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(feedbackInitialValue);
  const [openAppointment, setOpenAppointment] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(appointmentInitialValue);
  const { showPopup } = usePopup();
  const { createFeedback } = useFeedbackStore();
  const { createAppointment } = useAppointmentStore();
  const { fetchOffices, offices } = useOfficeStore();

  // Fetch Offices Data
  useEffect(() => {
    const loadOffices = async () => {
      try {
        await fetchOffices();
      } catch (error) {
        console.error('Failed to fetch offices:', error);
        showPopup(error.message, 'error');
      }
    };
    loadOffices();
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Feedback Handlers
  const handleFeedbackOpen = () => {
    setFeedbackData(feedbackInitialValue);
    setOpenFeedback(true);
  };

  const handleFeedbackClose = () => {
    setOpenFeedback(false);
    setFeedbackData(feedbackInitialValue);
  };

  const onFeedbackChange = (e: any) => {
    const { name, value } = e.target;
    setFeedbackData({ ...feedbackData, [name]: value });
  };

  const handleFeedbackSubmit = async () => {
    try {
      feedbackData.email = feedbackData.email?.trim() || undefined;
      const data = await createFeedback(feedbackData);
      showPopup(data.message, 'success');
      handleFeedbackClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  };

  const feedbackFields = [
    { name: "fullName", type: "text", label: "Maqaa Guutuu" },
    { name: "email", type: "text", inputType: "email", label: "Imeeyilii" },
    { name: "phone", type: "text", inputType: "tel", label: "Bilbila" },
    { name: "comment", type: "richtext", label: "Yaada" },
    {
      name: 'officeId',
      type: 'select',
      label: 'Kutaa Magaalaa',
      options: offices.map((office) => ({
        label: office.name,
        value: office.id,
      })),
    },
  ];

  // Appointment Handlers
  const handleAppointmentOpen = () => {
    setAppointmentData(appointmentInitialValue);
    setOpenAppointment(true);
  };

  const handleAppointmentClose = () => {
    setOpenAppointment(false);
    setAppointmentData(appointmentInitialValue);
  };

  const onAppointmentChange = (e: any) => {
    const { name, value } = e.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const handleAppointmentSubmit = async () => {
    try {
      appointmentData.email = appointmentData.email?.trim() || undefined;
      const data = await createAppointment(appointmentData);
      showPopup(data.message, 'success');
      handleAppointmentClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  };

  // Appointment Fields (now including offices)
  const appointmentFields = [
    { name: "firstName", type: "text", label: "Maqaa duraa", disabled: true },
    { name: "middleName", type: "text", label: "Maqaa Abbaa", disabled: true },
    { name: "lastName", type: "text", label: "Maqaa Akaakayyuu", disabled: true },
    { name: "phone", type: "text", inputType: "tel", label: "Bilbila", disabled: true },
    { name: "email", type: "text", inputType: "email", label: "Imeeyilii", disabled: true },
    { name: 'address', type: 'text', label: 'Tessoo' },
    { name: "reason", type: "richtext", label: "Sababa", disabled: true },
    {
      name: 'officeId',
      type: 'select',
      label: 'Kutaa Magaalaa',
      options: offices.map((office) => ({
        label: office.name,
        value: office.id,
      })),
    },
  ];

  return (
    <section
      class="relative bg-cover bg-center h-screen"
      style={{ backgroundImage: "url('/assets/sheger city hero.webp')" }}
    >
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 flex items-center justify-center h-full">
        <div class="text-center px-4 mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-white drop-shadow-lg text-stroke" data-aos="zoom-in">
            {t('heroTitle')}
          </h1>
          <p class="text-xl md:text-3xl text-gray-200 mt-4 drop-shadow-md text-stroke font-bold" data-aos="zoom-in-up">
            {t('heroSubtitle')}
          </p>
          <div class="mt-8 flex flex-col sm:flex-row justify-center lg:gap-8 gap-4 max-w-screen-md mx-auto">
            <a
              class="flex-1 min-w-[150px] px-6 py-3 bg-main-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 transition duration-300"
              href="/auth/login"
              data-aos="fade-right"
            >
              {t('login')}
            </a>
            <button
              class="flex-1 min-w-[150px] px-6 py-3 border border-white text-white font-semibold rounded-lg shadow-md hover:bg-white hover:text-black transition duration-300"
              onClick={handleFeedbackOpen}
              data-aos="fade-up"
            >
              {t('giveFeedback')}
            </button>
            <button
              class="flex-1 min-w-[150px] px-6 py-3 bg text-white font-semibold rounded-lg shadow-md hover:bg-main-black transition duration-300"
              onClick={handleAppointmentOpen}
              data-aos="fade-left"
            >
              {t('appointment')}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <FormDialog
        open={openFeedback}
        handleClose={handleFeedbackClose}
        data={feedbackData}
        onChange={onFeedbackChange}
        handleFormSubmit={handleFeedbackSubmit}
        fields={feedbackFields}
      />

      {/* Appointment Form */}
      <FormDialog
        open={openAppointment}
        handleClose={handleAppointmentClose}
        data={appointmentData}
        onChange={onAppointmentChange}
        handleFormSubmit={handleAppointmentSubmit}
        fields={appointmentFields}
      />
    </section>
  );
};

export default Hero;
