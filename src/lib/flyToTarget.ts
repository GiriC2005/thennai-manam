export function flyToTarget({
  source,
  targetId,
  imageUrl,
}: {
  source: HTMLElement | null;
  targetId: string;
  imageUrl?: string;
}) {
  if (!source || !imageUrl) return;

  const target = document.getElementById(targetId);

  if (!target) return;

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const flyingImage = document.createElement('img');

  flyingImage.src = imageUrl;

  const startWidth = Math.min(sourceRect.width, 140);
  const startHeight = Math.min(sourceRect.height, 140);

  const startLeft =
    sourceRect.left +
    sourceRect.width / 2 -
    startWidth / 2;

  const startTop =
    sourceRect.top +
    sourceRect.height / 2 -
    startHeight / 2;

  const endX =
    targetRect.left +
    targetRect.width / 2 -
    (startLeft + startWidth / 2);

  const endY =
    targetRect.top +
    targetRect.height / 2 -
    (startTop + startHeight / 2);

  flyingImage.style.position = 'fixed';
  flyingImage.style.left = `${startLeft}px`;
  flyingImage.style.top = `${startTop}px`;
  flyingImage.style.width = `${startWidth}px`;
  flyingImage.style.height = `${startHeight}px`;

  flyingImage.style.objectFit = 'cover';
  flyingImage.style.borderRadius = '16px';

  flyingImage.style.pointerEvents = 'none';
  flyingImage.style.zIndex = '9999';

  flyingImage.style.boxShadow =
    '0 10px 30px rgba(0,0,0,0.18)';

  document.body.appendChild(flyingImage);

  const animation = flyingImage.animate(
    [
      {
        transform:
          'translate3d(0, 0, 0) scale(1) rotate(0deg)',
        opacity: 1,
        borderRadius: '16px',
      },
      {
        transform: `
          translate3d(
            ${endX * 0.45}px,
            ${endY * 0.25 - 35}px,
            0
          )
          scale(0.75)
          rotate(-8deg)
        `,
        opacity: 0.95,
      },
      {
        transform: `
          translate3d(
            ${endX}px,
            ${endY}px,
            0
          )
          scale(0.12)
          rotate(8deg)
        `,
        opacity: 0.15,
        borderRadius: '999px',
      },
    ],
    {
      duration: 750,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    }
  );

  animation.onfinish = () => {
    flyingImage.remove();

    // Small bounce on target icon
    target.animate(
      [
        {
          transform: 'scale(1)',
        },
        {
          transform: 'scale(1.25)',
        },
        {
          transform: 'scale(0.92)',
        },
        {
          transform: 'scale(1)',
        },
      ],
      {
        duration: 350,
        easing: 'ease-out',
      }
    );
  };

  animation.oncancel = () => {
    flyingImage.remove();
  };
}