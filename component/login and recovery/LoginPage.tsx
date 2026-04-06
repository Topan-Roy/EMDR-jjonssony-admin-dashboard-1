"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLoginMutation } from "../redux/features/authApi";
import { clearStoredAuth } from "../redux/authStorage";
import { useAppDispatch } from "../redux/hooks";
import { logout, setLogin } from "../redux/features/authSlice";

const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
    if (!error) {
        return "Login failed. Please try again.";
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

    return "Login failed. Please try again.";
};

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [login, { isLoading }] = useLoginMutation();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Email and password are required.");
            return;
        }

        setErrorMessage(null);

        try {
            const response = await login({
                email: email.trim(),
                password,
            }).unwrap();
            const userRole = response.user.role.toLowerCase();

            if (userRole !== "admin") {
                dispatch(logout());
                clearStoredAuth();
                setErrorMessage("Only admin is allowed to access this panel.");
                return;
            }

            dispatch(
                setLogin({
                    user: response.user,
                    token: response.session.accessToken,
                    refreshToken: response.session.refreshToken,
                })
            );

            router.replace("/dashboard");
        } catch (error) {
            setErrorMessage(getErrorMessage(error as FetchBaseQueryError | SerializedError));
        }
    };

    return (
        <main className="flex flex-col min-h-screen lg:flex-row">
            {/* Left Side: Login Form */}
            <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 bg-[#4f795a] text-white sm:px-16 lg:px-24">
                <div className="max-w-md mx-auto lg:mx-0 w-full">
                    <h1 className="mb-8 text-4xl  ">Login to your account</h1>

                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit}
                    >
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-light text-gray-200">
                                Enter your e-mail address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                placeholder="Enter your e-mail address"
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full px-4 py-3 bg-[#5a8466] border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-gray-300/60"
                                autoComplete="email"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-light text-gray-200">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    placeholder="Password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full px-4 py-3 bg-[#5a8466] border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-gray-300/60"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300/70 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-left">
                            <Link href="/auth/recover" className="text-sm font-medium text-[#e38c7f] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {errorMessage && (
                            <p className="rounded-md border border-red-300 bg-red-100/90 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </p>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full py-4 mt-4 font-bold tracking-wide text-black transition-colors bg-[#fbe5cd] rounded-lg hover:bg-[#f2d8bd] disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
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
