import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function CoursePage({ courseId }) {
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaybackUrl = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError("Debes iniciar sesión para ver este curso.");
          setLoading(false);
          return;
        }

        // 🔹 Obtener token de Firebase
        const token = await user.getIdToken();

        // 🔹 Llamar a tu backend para obtener URL firmada de Mux
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/videos/${courseId}/playback`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("No tienes acceso a este video");

        const data = await res.json();
        setPlaybackUrl(data.playbackUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybackUrl();
  }, [courseId]);

  if (loading) return <p>Cargando video...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="video-container">
      {playbackUrl ? (
        <video controls src={playbackUrl} width="100%" />
      ) : (
        <p>No se encontró el video.</p>
      )}
    </div>
  );
}
