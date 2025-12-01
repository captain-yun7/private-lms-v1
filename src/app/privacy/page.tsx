export const metadata = {
  title: '개인정보처리방침',
  description: '개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">개인정보처리방침</h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <p className="text-text-secondary leading-relaxed">
                코로아이 주식회사(이하 &quot;회사&quot;)는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을
                보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은
                처리방침을 두고 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">1. 수집하는 개인정보 항목</h2>
              <p className="text-text-secondary mb-3">회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">필수항목</h3>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>이름, 이메일 주소</li>
                <li>소셜 로그인 시: 소셜 서비스 ID, 프로필 이미지</li>
              </ul>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">결제 시 수집항목</h3>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>신용카드 결제: 카드사명, 카드번호(일부)</li>
                <li>계좌이체: 은행명, 계좌번호(일부)</li>
                <li>환불 시: 환불계좌 정보(은행명, 계좌번호, 예금주)</li>
              </ul>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">자동 수집항목</h3>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                <li>기기 정보(기기 식별자, 운영체제, 브라우저 정보)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">2. 개인정보의 수집 및 이용목적</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li><strong>회원관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정 이용 방지</li>
                <li><strong>서비스 제공:</strong> 콘텐츠 제공, 수강 이력 관리, 맞춤 서비스 제공</li>
                <li><strong>결제 및 환불:</strong> 유료 서비스 결제, 환불 처리</li>
                <li><strong>마케팅 및 광고:</strong> 이벤트 정보 및 참여기회 제공, 광고성 정보 제공 (동의 시)</li>
                <li><strong>서비스 개선:</strong> 신규 서비스 개발, 접속 빈도 파악, 통계학적 분석</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">3. 개인정보의 보유 및 이용기간</h2>
              <p className="text-text-secondary mb-3">
                회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
                단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 관계법령에서 정한
                일정한 기간 동안 회원정보를 보관합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li><strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래법)</li>
                <li><strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래법)</li>
                <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 (전자상거래법)</li>
                <li><strong>접속에 관한 기록:</strong> 3개월 (통신비밀보호법)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-text-secondary mb-3">
                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                다만, 아래의 경우에는 예외로 합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">5. 개인정보 처리의 위탁</h2>
              <p className="text-text-secondary mb-3">
                회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-bg-light">
                      <th className="border border-border px-4 py-2 text-left">수탁업체</th>
                      <th className="border border-border px-4 py-2 text-left">위탁업무</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2 text-text-secondary">토스페이먼츠</td>
                      <td className="border border-border px-4 py-2 text-text-secondary">전자결제 대행</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2 text-text-secondary">Supabase</td>
                      <td className="border border-border px-4 py-2 text-text-secondary">데이터베이스 호스팅</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2 text-text-secondary">Vercel</td>
                      <td className="border border-border px-4 py-2 text-text-secondary">웹 호스팅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">6. 이용자의 권리와 행사방법</h2>
              <p className="text-text-secondary mb-3">
                이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="text-text-secondary mt-3">
                위 권리 행사는 서비스 내 설정 메뉴 또는 고객센터를 통해 하실 수 있으며, 회사는
                이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">7. 개인정보의 파기</h2>
              <p className="text-text-secondary mb-3">
                회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li><strong>전자적 파일:</strong> 복원이 불가능한 방법으로 영구 삭제</li>
                <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">8. 개인정보의 안전성 확보 조치</h2>
              <p className="text-text-secondary mb-3">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>개인정보의 암호화</li>
                <li>해킹 등에 대비한 기술적 대책</li>
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>개인정보 접근 제한</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">9. 쿠키의 사용</h2>
              <p className="text-text-secondary mb-3">
                회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로
                불러오는 '쿠키(cookie)'를 사용합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li><strong>쿠키 사용 목적:</strong> 로그인 상태 유지, 이용자 맞춤 서비스 제공</li>
                <li><strong>쿠키 설정 거부:</strong> 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용에 제한이 있을 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">10. 개인정보 보호책임자</h2>
              <p className="text-text-secondary mb-3">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
                정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
                지정하고 있습니다.
              </p>
              <div className="bg-bg-light p-4 rounded-lg">
                <p className="text-text-secondary">
                  <strong>개인정보 보호책임자</strong><br />
                  성명: 서종교<br />
                  직책: 대표이사<br />
                  연락처: shipedu@naver.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">11. 개인정보 침해 관련 상담 및 신고</h2>
              <p className="text-text-secondary mb-3">
                개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
                <li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
                <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
              </ul>
            </section>

            <section className="pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-text-primary mb-4">사업자 정보</h2>
              <div className="bg-bg-light p-4 rounded-lg mb-6">
                <p className="text-text-secondary">
                  상호: 코로아이 주식회사<br />
                  대표자: 서중교<br />
                  사업자등록번호: 609-81-86463<br />
                  주소: 경상남도 창원시 성산구 연덕로15번길 83(웅남동)<br />
                  이메일: shipedu@naver.com
                </p>
              </div>
              <p className="text-text-secondary">
                <strong>부칙</strong><br />
                본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
