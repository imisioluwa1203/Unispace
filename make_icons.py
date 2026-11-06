from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BLUE = (31, 111, 235)
YELLOW = (255, 212, 59)
WHITE = (255, 255, 255)

OUT = Path(__file__).parent / "frontend" / "public"
OUT.mkdir(parents=True, exist_ok=True)


def make_icon(size):
    img = Image.new("RGB", (size, size), BLUE)
    draw = ImageDraw.Draw(img)

    # yellow highlighter stroke, like the title in the app
    draw.rounded_rectangle(
        (size * 0.24, size * 0.62, size * 0.76, size * 0.72),
        radius=size * 0.04,
        fill=YELLOW,
    )

    # the letter U, centred
    try:
        font = ImageFont.truetype("arialbd.ttf", int(size * 0.5))
    except OSError:
        font = ImageFont.load_default()
    draw.text((size / 2, size * 0.5), "U", font=font, fill=WHITE, anchor="mm")
    return img


for size in (192, 512):
    make_icon(size).save(OUT / f"icon-{size}.png")
    print("saved", OUT / f"icon-{size}.png")