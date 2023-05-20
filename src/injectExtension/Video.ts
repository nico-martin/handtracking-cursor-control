class Video {
  private static instance: Video;
  public element: HTMLVideoElement;
  public stream: MediaStream;
  public wrapper: HTMLDivElement;
  public cameras: Array<MediaDeviceInfo>;

  private constructor() {}

  public init = () => {
    this.element = document.createElement('video');
    this.element.width = 0;
    this.element.height = 0;
    this.element.autoplay = true;
    this.element.muted = true;
    this.wrapper.append(this.element);
  };

  public static getInstance(wrapper: HTMLDivElement): Video {
    if (!Video.instance) {
      Video.instance = new Video();
    }
    Video.instance.wrapper = wrapper;

    return Video.instance;
  }

  public activate = (activeCameraId: string = ''): Promise<void> =>
    new Promise((resolve) => {
      navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
        this.cameras = deviceInfos.filter(
          (device) => device.kind === 'videoinput'
        );

        navigator.mediaDevices
          .getUserMedia({
            video: {
              deviceId: activeCameraId
                ? activeCameraId
                : this.cameras[0].deviceId,
            },
          })
          .then((stream) => {
            this.stream = stream;
            this.element.height = this.stream
              .getVideoTracks()[0]
              .getSettings().height;
            this.element.width = this.stream
              .getVideoTracks()[0]
              .getSettings().width;
            this.element.srcObject = this.stream;
            this.element.addEventListener('loadeddata', (e) => resolve());
          });
      });
    });

  public destroy = () => {
    this.stream.getTracks().map((track) => track.stop());
  };
}

export default Video;
