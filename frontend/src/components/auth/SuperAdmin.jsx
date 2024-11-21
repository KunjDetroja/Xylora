import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CustomInput } from "../ui/input";
import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { superAdminSchema, superAdminSchemaWithOTP } from "@/validators/users";
import { useSearchParams } from "react-router-dom";
import { CustomOTPInput } from "../ui/input-otp";
import { BadgeAlert, BadgeCheck, Loader2 } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { CustomTooltip } from "../ui/tooltip";
import { useCreateSuperAdminMutation } from "@/services/organization.service";
import { useOtpGenerateMutation } from "@/services/auth.service";
import { useCheckEmailMutation, useCheckUsernameMutation } from "@/services/user.service";

const SuperAdmin = () => {
  const [superAdmin, { isLoading }] = useCreateSuperAdminMutation();
  const [generateOtp, { isLoading: isOTPGenerating }] = useOtpGenerateMutation();

  const [step, setStep] = useState(1);
  const [animationClass, setAnimationClass] = useState("");
  const [formData, setFormData] = useState({});

  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get("id");

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(superAdminSchema)
  });

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(superAdminSchemaWithOTP),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    if (step === 1) {
      const isValid = await trigger();
      if (!isValid) return;

      // eslint-disable-next-line no-unused-vars
      const { confirmpassword, ...dataWithoutConfirm } = data;
      setFormData(dataWithoutConfirm);
      try {
        const response = await generateOtp({
          organization_id: organizationId,
        }).unwrap();
        if (!response) {
          toast.error("Error generating OTP. Please try again.");
          return;
        }
        setAnimationClass("slide-enter");
        setTimeout(() => {
          setStep(2);
          setAnimationClass("slide-enter-active");
        }, 0);
      } catch (error) {
        console.log(error);
        toast.error("Error generating OTP. Please try again.");
      }
    }
  };

  const onOtpSubmit = async (otpData) => {
    try {
      const allData = { ...formData, ...otpData, organization_id: organizationId };
      const response = await superAdmin(allData).unwrap();
      if (response) {
        toast.success("Register successful!");
      } else {
        toast.error("Something went wrong! Please try again later.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleBack = () => {
    setAnimationClass("slide-back-enter");
    setTimeout(() => {
      setStep(1);
      setAnimationClass("slide-back-enter-active");
    }, 0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl bg-preprimary rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row shadow-custom rounded-[2.5rem]">
          <div className="md:w-2/5 hidden md:flex items-center justify-center">
            <div className="max-w-md p-6 z-50">
              <img
                src="/images/super-admin.png"
                alt="Meeting illustration"
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="md:w-3/5 p-6 px-10 bg-white dark:bg-black rounded-[2.5rem]">
            <h1 className="text-3xl font-bold my-6 mb-8">Super Admin</h1>
            {step === 1 ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className={`space-y-4 min-h-[500px] ${animationClass} z-10`}
              >
                <SuperAdminDetailsForm register={register} errors={errors} setError={setError} clearErrors={clearErrors} />
                <div className="flex justify-end !mt-8">
                  <Button type="submit" disabled={isLoading || isOTPGenerating}>
                    Next
                    {(isLoading || isOTPGenerating) && (
                      <Loader2 className="mr-2 ml-4 animate-spin" size={20} />
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleOtpSubmit(onOtpSubmit)}
                className={`space-y-4 min-h-[500px] ${animationClass} z-10`}
              >
                <OTPForm
                  control={otpControl}
                  errors={otpErrors}
                />
                <div className="flex justify-between !mt-8">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Register
                    {isLoading && (
                      <Loader2 className="mr-2 ml-4 animate-spin" size={20} />
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SuperAdminDetailsForm = ({ register, errors, setError, clearErrors }) => {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isUserNameAvailable, setIsUserNameAvailable] = useState(undefined);
  const [isEmailAvailable, setIsEmailAvailable] = useState(undefined);

  const [checkUsername, { isLoading: checkingUserName }] = useCheckUsernameMutation();
  const [checkEmail, { isLoading: checkingEmail }] = useCheckEmailMutation();

  const checkIfUsernameExists = useCallback(async (username) => {
    if (!username) return;
    if (username.length < 3) {
      setIsUserNameAvailable(false);
      setError("username", { type: "manual", message: "Username must be at least 3 characters long" });
      return;
    }
    try {
      const response = await checkUsername({ username }).unwrap();
      if (response) {
        setIsUserNameAvailable(!response.exists);
        if (response.exists) {
          setError("username", { type: "manual", message: "Username is already taken" });
        } else {
          clearErrors("username");
        }
      }
    } catch (error) {
      console.log(error);
      const errorMessages = error.message.join(", ");
      setIsUserNameAvailable(false);
      setError("username", { type: "manual", message: errorMessages });
    }
  }, [checkUsername, setError, clearErrors]);

  const checkIfEmailExists = useCallback(async (email) => {
    if (!email) return;
    try {
      const response = await checkEmail({ email }).unwrap();
      if (response) {
        setIsEmailAvailable(!response.exists);
        if (response.exists) {
          setError("email", { type: "manual", message: "Email is already in use" });
        } else {
          clearErrors("email");
        }
      }
    } catch (error) {
      console.log(error);
      const errorMessages = error.message.join(", ");
      setIsEmailAvailable(false);
      setError("email", { type: "manual", message: errorMessages });
    }
  }, [checkEmail, setError, clearErrors]);

  useDebounce(email, 500, checkIfEmailExists);
  useDebounce(username, 500, checkIfUsernameExists);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          {...register("firstname")}
          error={errors.firstname}
        />
        <CustomInput
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          {...register("lastname")}
          error={errors.lastname}
        />
      </div>
      <div className="relative">
        <CustomInput
          type="text"
          label="Username"
          placeholder="Enter your username"
          {...register("username", {
            onChange: (e) => setUsername(e.target.value),
          })}
          error={errors.username}
        />
        {username && (
          <div className="absolute right-2 top-8">
            {
              isUserNameAvailable === undefined || checkingUserName ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                isUserNameAvailable ? (
                  <CustomTooltip className='bg-green-50 text-green-600 tracking-wide' content="Username is available">
                    <BadgeCheck className="text-green-500 rounded-full overflow-hidden" size={20} />
                  </CustomTooltip>
                ) : (
                  <CustomTooltip className='bg-red-50 text-red-500 tracking-wide' content={username.length < 3 ? 'Username must have atleast 3 character' : 'Username is not available'}>
                    <BadgeAlert className="text-red-500 rounded-full" size={20} />
                  </CustomTooltip>
                )
              )
            }
          </div>
        )}
      </div>
      <div className="relative">
        <CustomInput
          label="E-mail"
          type="email"
          placeholder="you@gmail.com"
          {...register("email", {
            onBlur: (e) => setEmail(e.target.value),
          })}
          error={errors.email}
        />
        {email && (
          <div className="absolute right-2 top-8">
            {
              isEmailAvailable === undefined || checkingEmail ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : (
                isEmailAvailable ? (
                  <CustomTooltip className='bg-green-50 text-green-600 tracking-wide' content="Email is available">
                    <BadgeCheck className="text-green-500 rounded-full overflow-hidden" size={20} />
                  </CustomTooltip>
                ) : (
                  <CustomTooltip className='bg-red-50 text-red-500 tracking-wide' content="Email is not available">
                    <BadgeAlert className="text-red-500 rounded-full" size={20} />
                  </CustomTooltip>
                )
              )
            }
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          {...register("password")}
          error={errors.password}
        />
        <CustomInput
          label="Confirm-Password"
          type="password"
          placeholder="Enter your confirm password"
          {...register("confirmpassword")}
          error={errors.confirmpassword}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CustomInput
          label="Employee-ID"
          type="text"
          placeholder="Enter your Employee-ID"
          {...register("employee_id")}
          error={errors.employee_id}
        />
        <CustomInput
          label="Phone"
          type="text"
          placeholder="Enter your phone number"
          {...register("phone_number")}
          error={errors.phone_number}
        />
      </div>
    </>
  );
};

const OTPForm = ({ control, errors }) => {
  return (
    <CustomOTPInput
      control={control}
      name="otp"
      label="Enter OTP"
      maxLength={6}
      error={errors.otp}
    />
  );
};

export default SuperAdmin;
