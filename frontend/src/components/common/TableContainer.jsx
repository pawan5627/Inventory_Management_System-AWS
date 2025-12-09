export default function TableContainer({ children }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full align-middle">
        {children}
      </div>
    </div>
  );
}
