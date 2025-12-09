export default function FilterRow({ children }) {
  return (
    <div className="px-4 py-3 border-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {children}
    </div>
  );
}
