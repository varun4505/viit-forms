const Toast: React.FC<{
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}> = ({ show, message, type }) => {
  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`}>
      {message}
    </div>
  );
};

export default Toast;