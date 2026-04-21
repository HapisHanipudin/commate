export default function LoginForm() {
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form>
        <div className="mb-3">
          <label className="block mb-1">Email</label>
          <input type="email" className="border p-2 w-full" placeholder="email@example.com" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Password</label>
          <input type="password" className="border p-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Masuk
        </button>
      </form>
    </div>
  );
}