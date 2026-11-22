import {useState} from 'react';
import {Play} from 'lucide-react';

type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
};

/**
 * Player do YouTube responsivo (16:9) que só carrega o iframe depois do clique.
 * Usa youtube-nocookie.com e a miniatura oficial do vídeo, deixando a página leve.
 */
export function YouTubeEmbed({videoId, title, className = ''}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-2xl bg-black ${className}`}
    >
      {isPlaying ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Assistir vídeo: ${title}`}
          className="group absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-colors">
              <Play
                className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-current"
                aria-hidden="true"
              />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
