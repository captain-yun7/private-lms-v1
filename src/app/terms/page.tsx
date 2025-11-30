import Link from 'next/link';

export const metadata = {
  title: '이용약관',
  description: '서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">이용약관</h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제1조 (목적)</h2>
              <p className="text-text-secondary leading-relaxed">
                본 약관은 코로아이 주식회사(이하 &quot;회사&quot;)가 운영하는 온라인 강의 플랫폼(이하 &quot;서비스&quot;)의
                이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
                규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제2조 (정의)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>"서비스"란 회사가 제공하는 온라인 강의 및 관련 서비스를 의미합니다.</li>
                <li>"회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.</li>
                <li>"콘텐츠"란 회사가 제공하는 강의 영상, 자료 등 일체의 정보를 의미합니다.</li>
                <li>"수강권"이란 특정 강의를 수강할 수 있는 권리를 의미합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
                <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                <li>약관이 변경되는 경우 회사는 변경 내용을 시행일 7일 전부터 서비스 내에 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제4조 (서비스의 제공)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>회사는 다음과 같은 서비스를 제공합니다:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>온라인 강의 콘텐츠 제공</li>
                    <li>강의 자료 다운로드</li>
                    <li>학습 진도 관리</li>
                    <li>기타 회사가 정하는 서비스</li>
                  </ul>
                </li>
                <li>서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다.</li>
                <li>회사는 시스템 점검, 교체 및 고장, 통신 두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제5조 (회원가입)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>회원가입은 이용자가 약관의 내용에 동의한 후 회원가입 신청을 하고, 회사가 이를 승낙함으로써 체결됩니다.</li>
                <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않을 수 있습니다:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                    <li>허위 정보를 기재한 경우</li>
                    <li>기타 회원으로 등록하는 것이 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제6조 (회원의 의무)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>회원은 다음 행위를 하여서는 안 됩니다:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>신청 또는 변경 시 허위 내용의 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>회사가 게시한 정보의 변경</li>
                    <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                    <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                    <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                    <li>콘텐츠의 무단 복제, 배포, 전송, 공연, 방송, 2차적 저작물 작성 등의 행위</li>
                    <li>계정 공유 및 양도</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제7조 (수강권 및 결제)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>회원은 회사가 정한 결제 방법을 통해 수강권을 구매할 수 있습니다.</li>
                <li>수강권 구매 시 결제 금액은 부가가치세를 포함한 금액입니다.</li>
                <li>수강 기간은 결제일로부터 각 강의에 명시된 기간 동안 유효합니다.</li>
                <li>수강 기간이 종료되면 해당 강의에 대한 접근 권한이 소멸됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제8조 (환불)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>환불은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 회사의 환불 정책에 따릅니다.</li>
                <li>자세한 환불 정책은 <Link href="/refund-policy" className="text-primary hover:underline">환불정책</Link> 페이지를 참조하시기 바랍니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제9조 (저작권)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>서비스 내 콘텐츠에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
                <li>회원은 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 등 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제10조 (면책조항)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
                <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 얻지 못한 것에 대하여 책임을 지지 않습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">제11조 (분쟁해결)</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.</li>
                <li>회사와 회원 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.</li>
              </ol>
            </section>

            <section className="pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-text-primary mb-4">사업자 정보</h2>
              <div className="bg-bg-light p-4 rounded-lg mb-6">
                <p className="text-text-secondary">
                  상호: 코로아이 주식회사<br />
                  대표자: 서종교<br />
                  사업자등록번호: 609-81-86463<br />
                  주소: 경상남도 창원시 성산구 연덕로15번길 83(웅남동)<br />
                  이메일: shipedu@naver.com
                </p>
              </div>
              <p className="text-text-secondary">
                <strong>부칙</strong><br />
                본 약관은 2025년 1월 1일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
