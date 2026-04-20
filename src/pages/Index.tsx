import GameBoard from "@/components/GameBoard";

const Index = () => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background">
      <h1 className="sr-only">Flow — Minimal Dot Connect Puzzle</h1>
      <div className="flex h-[100dvh] w-full max-w-xl flex-col">
        <GameBoard />
      </div>
    </main>
  );
};

export default Index;
