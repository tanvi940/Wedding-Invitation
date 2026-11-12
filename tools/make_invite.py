"""
Make the WhatsApp invitation: one video (MP4 with sound) + one QR card (PNG) for all guests.

    python tools/make_invite.py

Output: exports/wedding-invite.mp4 and exports/wedding-card.png
Needs:  pip install playwright imageio-ffmpeg && python -m playwright install chromium
"""
import base64, functools, http.server, socketserver, subprocess, threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORTS = ROOT / "exports"
FPS = 30


def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}"


def main():
    from playwright.sync_api import sync_playwright
    EXPORTS.mkdir(exist_ok=True)
    wav = EXPORTS / "_soundtrack.wav"
    video = EXPORTS / "wedding-invite.mp4"
    card = EXPORTS / "wedding-card.png"
    srv, base = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # 1. soundtrack
        print("Rendering soundtrack…")
        page = browser.new_page()
        page.goto(f"{base}/film.html")
        page.wait_for_function("window.RoyalAudio && window.FILM", timeout=60000)
        meta = page.evaluate("({d: FILM.duration, c: FILM.cues, song: (window.WEDDING && WEDDING.musicFile) || ''})")
        song = (ROOT / meta["song"]) if meta["song"] else None
        if song and not song.exists():
            print(f"  ! musicFile {meta['song']} not found — using the built-in music")
            song = None
        if song:
            meta["c"]["noMusic"] = True          # effects only; the song is mixed in below
        wav.write_bytes(base64.b64decode(page.evaluate("(m) => RoyalAudio.renderSoundtrack(m.d, m.c)", meta)))
        page.close()

        # 2. video, frame by frame
        total = int(round(meta["d"] * FPS))
        print(f"Rendering {total} video frames…")
        page = browser.new_page(viewport={"width": 720, "height": 1280}, device_scale_factor=1)
        page.goto(f"{base}/film.html")
        page.wait_for_function("window.FILM && FILM.ready", timeout=60000)
        page.wait_for_timeout(600)
        dur = meta["d"]
        if song:   # custom song under the effects, faded in and out
            audio_in = ["-i", str(wav), "-stream_loop", "-1", "-i", str(song)]
            audio_map = ["-filter_complex",
                         f"[2:a]atrim=0:{dur},volume=0.85,afade=t=in:d=2,afade=t=out:st={dur - 3}:d=3[m];"
                         f"[1:a]volume=1.6[f];[f][m]amix=inputs=2:duration=first:normalize=0[a]",
                         "-map", "0:v", "-map", "[a]"]
        else:
            audio_in = ["-i", str(wav)]
            audio_map = ["-af", "volume=1.8"]
        cmd = [ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
               *audio_in, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p",
               "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-profile:v", "high", "-level", "4.0",
               *audio_map, "-c:a", "aac", "-b:a", "160k", "-t", str(dur), "-movflags", "+faststart", str(video)]
        enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(total):
            page.evaluate(f"renderFrame({i / FPS})")
            enc.stdin.write(page.screenshot(type="jpeg", quality=92))
            if i % 150 == 0:
                print(f"  {i}/{total}")
        enc.stdin.close()
        if enc.wait() != 0:
            raise RuntimeError("ffmpeg failed")
        page.close()

        # 3. QR card
        print("Rendering card…")
        page = browser.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        page.goto(f"{base}/card.html")
        page.wait_for_function("window.CARD_READY === true", timeout=60000)
        page.wait_for_timeout(400)
        page.locator("#card").screenshot(path=str(card))
        url = page.evaluate("window.CARD_URL")
        page.close()
        browser.close()
    srv.shutdown()
    wav.unlink(missing_ok=True)
    print(f"Done:\n  {video.relative_to(ROOT)}\n  {card.relative_to(ROOT)}\n  QR opens: {url}")


if __name__ == "__main__":
    main()
