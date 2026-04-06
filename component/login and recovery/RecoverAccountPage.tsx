"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
    useRecoverAccountMutation,
    useSendVerificationOtpMutation,
    useVerifyRecoveryOtpMutation,
} from "../redux/features/authApi";

type RecoveryStep = "email" | "code" | "reset";

const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
    if (!error) {
        return "Request failed. Please try again.";
    }

    if ("data" in error) {
        const data = error.data;

        if (typeof data === "string" && data.trim().length > 0) {
            return data;
        }

        if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;

            if (typeof record.message === "string" && record.message.trim().length > 0) {
                return record.message;
            }

            if (record.data && typeof record.data === "object") {
                const nestedRecord = record.data as Record<string, unknown>;

                if (typeof nestedRecord.message === "string" && nestedRecord.message.trim().length > 0) {
                    return nestedRecord.message;
                }
            }
        }
    }

    if ("message" in error && typeof error.message === "string" && error.message.trim().length > 0) {
        return error.message;
    }

    return "Request failed. Please try again.";
};

export default function RecoverAccountPage() {
    const [step, setStep] = useState<RecoveryStep>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [recoveryAccessToken, setRecoveryAccessToken] = useState("");
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const [sendVerificationOtp, { isLoading: isSendingOtp }] = useSendVerificationOtpMutation();
    const [verifyRecoveryOtp, { isLoading: isVerifyingOtp }] = useVerifyRecoveryOtpMutation();
    const [recoverAccount, { isLoading: isRecoveringPassword }] = useRecoverAccountMutation();

    const isLoading = isSendingOtp || isVerifyingOtp || isRecoveringPassword;

    const clearMessages = () => {
        setStatusMessage(null);
        setErrorMessage(null);
    };

    const handleSendOtp = async () => {
        if (!email.trim()) {
            setErrorMessage("Email is required.");
            return;
        }

        clearMessages();

        try {
            const response = await sendVerificationOtp({ email: email.trim() }).unwrap();
            setDevOtp(response._dev_otp ?? null);
            setStatusMessage(response.message || "OTP sent to your email.");
            setStep("code");
        } catch (error) {
            setErrorMessage(getErrorMessage(error as FetchBaseQueryError | SerializedError));
        }
    };

    const handleVerifyOtp = async () => {
        if (!email.trim()) {
            setErrorMessage("Please provide your email first.");
            setStep("email");
            return;
        }

        if (!otp.trim()) {
            setErrorMessage("Recovery code is required.");
            return;
        }

        clearMessages();

        try {
            const response = await verifyRecoveryOtp({
                email: email.trim(),
                otp: otp.trim(),
            }).unwrap();

            setRecoveryAccessToken(response.accessToken);
            setStatusMessage(response.message || "OTP verified successfully.");
            setStep("reset");
        } catch (error) {
            setErrorMessage(getErrorMessage(error as FetchBaseQueryError | SerializedError));
        }
    };

    const handleResetPassword = async () => {
        if (!recoveryAccessToken) {
            setErrorMessage("Please verify OTP before resetting password.");
            setStep("code");
            return;
        }

        if (!newPassword || !confirmPassword) {
            setErrorMessage("Both password fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("New password and confirm password do not match.");
            return;
        }

        clearMessages();

        try {
            const response = await recoverAccount({
                accessToken: recoveryAccessToken,
                newPassword,
                confirmPassword,
            }).unwrap();

            setStatusMessage(response.message || "Password reset successfully.");
            router.replace("/login");
        } catch (error) {
            setErrorMessage(getErrorMessage(error as FetchBaseQueryError | SerializedError));
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (step === "email") {
            await handleSendOtp();
            return;
        }

        if (step === "code") {
            await handleVerifyOtp();
            return;
        }

        await handleResetPassword();
    };


    return (
        <main className="flex flex-col min-h-screen lg:flex-row">
            {/* Left Side: Form Content */}
            <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 bg-[#4f795a] text-white sm:px-16 lg:px-24">
                <div className="max-w-md mx-auto lg:mx-0 w-full">
                    <h1 className="mb-2 text-3xl  ">Recover Account</h1>
                    <p className="mb-10 text-sm font-light text-gray-200">
                        Enter your email and we will send you a recovery code
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {statusMessage && (
                            <p className="rounded-md border border-emerald-300 bg-emerald-100/90 px-3 py-2 text-sm text-emerald-800">
                                {statusMessage}
                            </p>
                        )}

                        {errorMessage && (
                            <p className="rounded-md border border-red-300 bg-red-100/90 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </p>
                        )}

                        {/* STEP 1: Email Address */}
                        {step === "email" && (
                            <>
                                <div>
                                    <label className="block mb-2 text-sm font-light">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        placeholder="Enter your email address"
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="w-full px-4 py-3 bg-[#5c8469] border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-white/40 placeholder:text-gray-300/50"
                                        autoComplete="email"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 font-bold text-black transition-colors bg-[#fbe5cd] rounded-lg hover:bg-[#f2d8bd]"
                                >
                                    {isLoading ? "Sending..." : "Send Recovery Email"}
                                </button>
                                <div className="flex justify-center items-center gap-2 pt-4">
                                    <ChevronLeft size={16} />
                                    <Link href="/login" className="text-sm font-light hover:underline">Back To Login</Link>
                                </div>
                            </>
                        )}

                        {/* STEP 2: Recovery Code */}
                        {step === "code" && (
                            <>
                                <div>
                                    <label className="block mb-2 text-sm font-light">Recovery Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        placeholder="Recovery Code"
                                        onChange={(event) => setOtp(event.target.value)}
                                        className="w-full px-4 py-3 bg-[#5c8469] border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-white/40 placeholder:text-gray-300/50"
                                    />
                                </div>
                                {/* {devOtp && (
                                    <p className="text-xs text-[#fbe5cd]/90">
                                        Dev OTP: <span className="font-bold tracking-wider">{devOtp}</span>
                                    </p>
                                )} */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 font-bold text-black transition-colors bg-[#fbe5cd] rounded-lg hover:bg-[#f2d8bd]"
                                >
                                    {isLoading ? "Verifying..." : "Next"}
                                </button>
                                <div className="text-center pt-2">
                                    <p className="text-sm font-light">
                                        Didn&apos;t receive the code?{" "}
                                        <button
                                            type="button"
                                            className="font-bold hover:underline"
                                            onClick={() => void handleSendOtp()}
                                            disabled={isLoading}
                                        >
                                            Resend
                                        </button>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="flex items-center justify-center gap-2 mt-6 mx-auto text-sm font-light hover:underline"
                                    >
                                        <ChevronLeft size={16} /> Edit Email
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 3: Reset Password */}
                        {step === "reset" && (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-light">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                placeholder="Password"
                                                onChange={(event) => setNewPassword(event.target.value)}
                                                className="w-full px-4 py-3 bg-[#5c8469] border border-white/20 rounded-md focus:outline-none"
                                                autoComplete="new-password"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-white/60">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-light">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                placeholder="Confirm Password"
                                                onChange={(event) => setConfirmPassword(event.target.value)}
                                                className="w-full px-4 py-3 bg-[#5c8469] border border-white/20 rounded-md focus:outline-none"
                                                autoComplete="new-password"
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-white/60">
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 font-bold text-black transition-colors bg-[#fbe5cd] rounded-lg hover:bg-[#f2d8bd]"
                                >
                                    {isLoading ? "Updating..." : "Set New Password"}
                                </button>
                                <Link href="/login" className="flex items-center justify-center gap-2 mt-6 mx-auto text-sm font-light hover:underline">
                                    <ChevronLeft size={16} /> Back To Login
                                </Link>
                            </>
                        )}
                    </form>
                </div>
            </div>

            {/* Right Side: Logo Display */}
            <div className="items-center justify-center hidden w-full bg-white lg:flex lg:w-1/2">
                <div className="flex flex-col items-center text-center">
                    {/* 
                    Note: Replace '/logo.png' with your actual logo path.
                    I'm using a placeholder structure to match your image layout.
                   */}
                    <div className="relative w-[377px] h-[367px] mb-4">
                        {/* You would use an <Image /> component here with your specific file */}
                        <div className="flex items-center justify-center w-full h-full">
                            {/* SVG Placeholder for the Tree Logo */}
                            <Image
                                src="/image/logo.png"
                                alt="UK INKIND Logo"
                                className="object-contain"
                                width={377}
                                height={367}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
