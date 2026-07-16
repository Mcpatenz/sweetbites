"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        const userData = JSON.parse(userParam);
        localStorage.setItem("sweet-bites-user", JSON.stringify(userData));
        router.replace("/");
      } catch {
        router.replace("/?error=invalid_data");
      }
    } else {
      router.replace("/?error=no_user_data");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-amber-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-amber-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Signing you in...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
