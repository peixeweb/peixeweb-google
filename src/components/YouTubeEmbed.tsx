import {ExternalLink} from 'lucide-react';

type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  /** Parâmetro "si" do código de incorporação do YouTube (opcional). */
  shareId?: string;
  className?: string;
};

/**
 * Player do YouTube incorporado direto na página, em 16:9 responsivo.
 * Mantém o link "Assistir no YouTube" como alternativa.
 */
export function YouTubeEmbed({
  videoId,
  title,
  shareId,
  className = '',
}: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}${
    shareId ? `?si=${shareId}` : ''
  }`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div>
      <div
        className={`relative w-full aspect-video overflow-hidden rounded-2xl bg-black ${className}`}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title={title}
          loading="lazy"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <p className="mt-3 text-center text-sm text-slate-600">
        Não carregou?{' '}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-black hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Assistir no YouTube</span>
        </a>
      </p>
    </div>
  );
}
