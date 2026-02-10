export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dark-600 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-t-accent-blue rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );
}
