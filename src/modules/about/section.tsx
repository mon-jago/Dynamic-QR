import Container from "@/components/ui/container";

const AboutSection = () => {
  return (
    <section className="hidden md:flex min-h-screen w-full bg-white items-center">
      <Container className="w-full py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 w-full">
          <div className="flex flex-col justify-center grow">
            <div className="w-full">
              <p className="text-[clamp(2.7rem,2vw,1.75rem)] font-h6-sans leading-none tracking-[-0.03em] text-black mb-5">
                Mari Kenal Lebih Dekat
              </p>

              <h2 className="mb-8 text-[clamp(2.7rem,4vw,4rem)] font-h4-sans leading-[1.03] tracking-[-0.04em] text-black">
                Porsenigama 2026
              </h2>

              <p className="text-[clamp(1.3rem,1.2vw,1.125rem)] font-b2 leading-[1.6] tracking-[-0.01em] text-justify text-black">
                Pekan Olahraga dan Seni Universitas Gadjah Mada mempertemukan
                mahasiswa dari berbagai Fakultas dan Sekolah untuk menyalurkan
                bakat di bidang <span className="font-bold">olahraga dan seni</span>
                . Melalui tema XXX Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-center lg:justify-end">
            <div
              className="w-full min-w-152.5 aspect-610/399 bg-[#e6e6e6] shadow-sm rotate-0 opacity-100"
              aria-label="Porsenigama video placeholder"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutSection;
