import Logo from "./Logo";
import { ReactNode } from "react";

interface StudioPanelProps {
  edition: string;
  quote: ReactNode;
  tag: string;
}

export default function StudioPanel({ edition, quote, tag }: StudioPanelProps) {
  return (
    <aside className="studio-panel" aria-label="NutriSync coaching studio">
      <div className="panel-top">
        <Logo />
        <span className="edition">{edition}</span>
      </div>

      <div className="panel-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="pulse pulse-a" />
        <div className="pulse pulse-b" />

        <div className="cadence">
          <span>WEEKLY RHYTHM</span>
          <strong>
            04<span>/</span>06
          </strong>
          <div className="bars">
            <i />
            <i />
            <i />
            <i className="muted" />
            <i className="muted" />
            <i className="muted" />
          </div>
        </div>

        <div className="coordinates">40&deg;42&prime;N&nbsp;&nbsp;&middot;&nbsp;&nbsp;74&deg;00&prime;W</div>
      </div>

      <div className="panel-bottom">
        <p>{quote}</p>
        <span>{tag}</span>
      </div>
    </aside>
  );
}
