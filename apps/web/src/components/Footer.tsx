export default function Footer() {
  return (
    <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-200 mt-auto">
      &copy; {new Date().getFullYear()} Commate. All rights reserved.
    </footer>
  );
}