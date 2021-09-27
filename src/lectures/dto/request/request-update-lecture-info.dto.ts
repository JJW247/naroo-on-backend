export class RequestUpdateLectureInfoDto {
  thumbnail: string | null;
  expired: Date | null;
  title: string | null;
  description: string | null;
  teacherName: string | null;
  images: string[] | null;
  videos: { url: string; title: string }[] | null;
}
