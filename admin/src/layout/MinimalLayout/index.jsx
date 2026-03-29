//for authentication pages as a minimal layout
import { Outlet } from 'react-router-dom';

export default function MinimalLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
