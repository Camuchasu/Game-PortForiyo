import os
from moviepy import VideoFileClip

asset_dir = "assets"
for file in os.listdir(asset_dir):
    if file.endswith(".mp4") and not file.startswith("temp_"):
        filepath = os.path.join(asset_dir, file)
        temp_filepath = os.path.join(asset_dir, "temp_" + file)
        
        # skip if file is small enough (arbitrary threshold like 25MB)
        if os.path.getsize(filepath) < 25 * 1024 * 1024:
            print(f"Skipping {file} (already under 25MB)")
            continue

        print(f"Compressing {file}...")
        
        try:
            clip = VideoFileClip(filepath)
            
            # Resize to ensure it's small enough for Cloudflare Pages (25MB limit)
            if clip.w > 800:
                clip = clip.resized(width=800)
            
            # Force fps down to 24 if it's over 24
            target_fps = min(clip.fps, 24) if clip.fps else 24

            clip.write_videofile(temp_filepath, 
                                 codec="libx264", 
                                 audio_codec="aac", 
                                 bitrate="700k", 
                                 fps=target_fps)
            clip.close()
            
            # Replace old file with the newly compressed one
            os.remove(filepath)
            os.rename(temp_filepath, filepath)
            print(f"Finished compressing {file}")
            
        except Exception as e:
            print(f"Error compressing {file}: {e}")
