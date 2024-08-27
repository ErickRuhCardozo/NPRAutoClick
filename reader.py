import cv2
import pytesseract
import pyautogui
import re
import threading
import pygetwindow
import time


CAMERA_INDEX = 1
pattern = re.compile(r'41\d{42}')
frame = None
browser: pygetwindow.Window = None
last_access_key = None


def get_browser() -> pygetwindow.Window:
    windows = pygetwindow.getAllWindows()
    for win in windows:
        if win.title.startswith('Nota Paraná'):
            return win
    raise Exception('Nota Paraná não está aberto!')


def get_frame(cap: cv2.VideoCapture):
    global frame
    while True:
        try:
            _, frame = cap.read()
            cv2.imshow('Webcam Feed', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        except Exception:
            pass


def decode_frame():
    global last_access_key
    while True:
        if frame is None:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        text = pytesseract.image_to_string(gray, config='--psm 6 -c tessedit_char_whitelist=0123456789')
        digits = pattern.search(text)
        if digits and digits.group() != last_access_key:
            last_access_key = digits.group()
            browser.activate()
            pyautogui.write(last_access_key)
            time.sleep(4)


if __name__ == "__main__":
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    browser = get_browser()
    cap = cv2.VideoCapture(CAMERA_INDEX)
    # cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    # cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    get_thread = threading.Thread(target=get_frame, args=(cap,))
    decode_thread = threading.Thread(target=decode_frame, daemon=True)
    get_thread.start()
    decode_thread.start()
    get_thread.join()
    cap.release()
    cv2.destroyAllWindows()
