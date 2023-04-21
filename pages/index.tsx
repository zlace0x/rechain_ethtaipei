import Head from "next/head";
import WorkflowBuilder from "../components/WorkflowBuilder";

export default function Home() {
  return (
    <>
      <Head>
        <title>ChainFlux</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-screen h-screen">
        <WorkflowBuilder />
      </div>
    </>
  );
}
