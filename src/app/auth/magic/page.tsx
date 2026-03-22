"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide. Aucun token trouvé.");
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch("/api/auth/magic-link/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage(`Bienvenue ${data.data?.prenom || ""} ! Connexion réussie.`);
        } else {
          setStatus("error");
          setMessage(data.error || "Lien expiré ou invalide.");
        }
      } catch {
        setStatus("error");
        setMessage("Erreur de connexion. Veuillez réessayer.");
      }
    }

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          YIRA Emploi
        </h1>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-600">Vérification en cours...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="text-green-500 text-5xl">&#10003;</div>
            <p className="text-green-700 font-medium">{message}</p>
            <a
              href="/test"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Accéder à mon évaluation
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-red-500 text-5xl">&#10007;</div>
            <p className="text-red-700 font-medium">{message}</p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        )}

        <p className="mt-8 text-xs text-gray-400">
          NOHAMA Consulting — evaluation.yira-ci.com
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      }
    >
      <MagicLinkContent />
    </Suspense>
  );
}
