import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toasty, TooltipProvider } from '@cloudflare/kumo';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function ServerApp({ url }: { url: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toasty>
          <StaticRouter location={url}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StaticRouter>
        </Toasty>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function render(url: string): { html: string } {
  return { html: renderToString(<ServerApp url={url} />) };
}
