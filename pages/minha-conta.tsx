import { GetServerSideProps } from 'next'

export default function MinhaContaRedirect() {
  return null
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/area-usuario',
      permanent: false,
    }
  }
}