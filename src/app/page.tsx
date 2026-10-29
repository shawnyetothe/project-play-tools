import Link from "next/link";
import { examples } from "@/lib/examples";
import { meta, tools } from "@/lib/data";
import { Doors } from "@/components/workspace/Doors";
import { HeroToy } from "@/components/workspace/HeroToy";
import { RuleCaption } from "@/components/workspace/RuleCaption";

const p5 = tools.find((tool) => tool.id === "p5");

export default function HomePage() {
  return (
    <div className="workspace">
      <section className="hero-home wrap">
        <div className="hero-copy">
          <p className="hero-kicker">PlayTools · live sketch</p>
          <div className="hero-titles">
            <h1 className="arm-a">Draw a line. Watch the rule take it.</h1>
            <h1 className="arm-b">Your move. The rules do the rest.</h1>
            <p className="sub">Play it. Then read the rules.</p>
          </div>
          <p className="hero-prompt">→ Drag across the drawing</p>
          <RuleCaption />
          <Doors />
        </div>
        <HeroToy />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function bind(){var canvas=document.querySelector("canvas.hero-art");if(!canvas||canvas.dataset.bound)return;canvas.dataset.bound="1";var pts=[];var drawing=false;function point(e){var r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}function end(){drawing=false;document.documentElement.dataset.drawing="0";if(pts.length<2)return;var r=canvas.getBoundingClientRect();window.__playStroke=pts.map(function(p){return {x:p.x/r.width,y:p.y/r.height};});canvas.dataset.drawn="1";}canvas.addEventListener("pointerdown",function(e){drawing=true;document.documentElement.dataset.drawing="1";try{canvas.setPointerCapture(e.pointerId);}catch(err){}pts=[point(e)];});canvas.addEventListener("pointermove",function(e){if(!drawing)return;pts.push(point(e));});canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();})();`,
          }}
        />
      </section>
      <section className="wrap lineage-grid" aria-label="Three lineages">
        {examples.filter((item) => item.kind === "lineage").slice(0, 3).map((item) => (
          <article key={item.slug}>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <p><Link href={`/examples/${item.slug}/`}>Open this example</Link></p>
          </article>
        ))}
      </section>
      <section className="wrap">
        <h2>Make it an edition</h2>
        <div className="edition-grid" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
        </div>
        <p><Link href="/generate/">Open Generate</Link></p>
        <p className="fact-line">
          {p5 ? `${p5.projectCount.toLocaleString()} of ${meta.counts.projects.toLocaleString()} projects in the ${meta.pulledLabel} pull use p5.js.` : "Tool counts are in the creative index."}{" "}
          <Link href="/tools/">Creative index</Link>
        </p>
      </section>
      <section className="wrap">
        <blockquote cite="https://www.cnbc.com/video/2024/11/13/ai-doesnat-stand-a-chance-against-actors-or-shakespeare-ben-affleck-says.html">
          <p>Craft is knowing how to work; art is knowing when to stop.</p>
          <footer>
            <a href="https://www.cnbc.com/video/2024/11/13/ai-doesnat-stand-a-chance-against-actors-or-shakespeare-ben-affleck-says.html">
              — Ben Affleck, CNBC Delivering Alpha, 2024
            </a>
          </footer>
        </blockquote>
      </section>
    </div>
  );
}
