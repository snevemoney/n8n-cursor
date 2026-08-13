import { Pathfinder } from './components/pathfinder';
import { Hero } from './components/hero';
import { Constraint } from './components/constraint';
import { Proof } from './components/proof';
import { HowWeWork } from './components/how-we-work';
import { CTA } from './components/cta';
import { Footer } from './components/footer';

export default function Home() {
  return (
    <main>
      <Pathfinder />
      <Hero />
      <hr className="section-divider" />
      <Constraint />
      <hr className="section-divider" />
      <Proof />
      <hr className="section-divider" />
      <HowWeWork />
      <hr className="section-divider" />
      <CTA />
      <Footer />
    </main>
  );
}
