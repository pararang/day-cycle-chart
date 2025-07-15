import { ExternalLink, Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left section - Project info */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">

            </div>
          </div>

          {/* Center section - Links */}
          <div className="flex items-center gap-6 text-sm">
            <span>Made by</span>
            <a
              href="https://pararang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>pararang</span>
            </a>
            <a
              href="https://github.com/pararang/day-cycle-chart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Source Code</span>
            </a>
          </div>

          {/* Right section - Copyright */}
          <div className="text-sm text-muted-foreground">

          </div>
        </div>

        {/* Bottom section - Acknowledgments */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="text-center text-xs text-muted-foreground">
            <p className="mb-2">
              <a target="_blank" rel="noopener noreferrer" href="https://icons8.com/icon/42788/clock">Favicon</a> by <a target="_blank" rel="noopener noreferrer" href="https://icons8.com">Icons8</a> <br /> Designed by Lovable, Assisted by Copilot and Amazon Q
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
