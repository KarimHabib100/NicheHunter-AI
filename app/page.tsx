import { Background, Hero, InputSection } from './components/landing';

export default function Home() {
  return (
    <>
      <Background />
      <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4">
        <div className="w-full max-w-4xl mx-auto space-y-16">
          <Hero />
          <InputSection />
        </div>
      </div>
    </>
  );
}
