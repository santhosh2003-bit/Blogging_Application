const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M44.5 20H24V28.5H35.7C34.2 33.1 29.7 36 24 36C16.8 36 10.5 29.7 10.5 22.5C10.5 15.3 16.8 9 24 9C27.1 9 29.9 10.1 32.1 12L38.1 6C34.3 2.7 29.4 0.5 24 0.5C11.5 0.5 1.5 10.5 1.5 22.5C1.5 34.5 11.5 44.5 24 44.5C36.5 44.5 46.5 34.5 46.5 22.5C46.5 21.1 46.3 19.6 46 18.2L44.5 20Z"
            fill="#FFC107"
          />
          <path
            d="M6.3 14.7L12.1 18.7C13.8 15.1 18.5 12.1 24 12.1C27.1 12.1 29.9 13.2 32.1 15L38.1 9C34.3 5.7 29.4 3.5 24 3.5C16.8 3.5 10.5 9.8 10.5 17C10.5 19.2 11.1 21.3 12.1 23.1L6.3 14.7Z"
            fill="#FF3D00"
          />
          <path
            d="M24 44.5C29.7 44.5 34.2 41.6 35.7 37H24V28.5H35.7C34.2 33.1 29.7 36 24 36C18.5 36 13.8 33.1 12.1 29.5L6.3 36.3C10.5 41.2 16.8 44.5 24 44.5Z"
            fill="#4CAF50"
          />
          <path
            d="M46 18.2L44.5 20C43.7 21.7 42.7 23.2 41.5 24.5C41.5 24.5 41.5 24.5 41.5 24.5C39.7 26.3 37.6 27.7 35.7 28.5C34.2 33.1 29.7 36 24 36C18.5 36 13.8 33.1 12.1 29.5L6.3 36.3C10.5 41.2 16.8 44.5 24 44.5C36.5 44.5 46.5 34.5 46.5 22.5C46.5 21.1 46.3 19.6 46 18.2Z"
            fill="#1976D2"
          />
        </g>
      </svg>
      Continue with Google
    </button>
  );
}
