import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="flex space-x-1 px-4">
        <NavLink
          to="/slicer"
          className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          Territory Slicer
        </NavLink>
        <NavLink
          to="/comparison"
          className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          Territory Comparison
        </NavLink>
        <NavLink
          to="/audit"
          className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          Audit Trail
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
