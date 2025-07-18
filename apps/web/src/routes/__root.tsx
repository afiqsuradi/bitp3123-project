import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
export const Route = createRootRoute({
  component: () => (
    <>
      <Header />

      <Outlet />
      <Footer />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  ),
})
