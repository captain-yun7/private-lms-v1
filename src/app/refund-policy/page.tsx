import Link from 'next/link';

export const metadata = {
  title: '환불정책',
  description: '환불 및 취소 정책',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">환불정책</h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <p className="text-text-secondary leading-relaxed">
                [회사명]은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」에
                따라 아래와 같은 환불 정책을 운영합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">1. 환불 가능 기간</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-bg-light">
                      <th className="border border-border px-4 py-3 text-left">구분</th>
                      <th className="border border-border px-4 py-3 text-left">환불 기준</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-3 text-text-secondary font-medium">
                        결제 후 7일 이내<br />
                        <span className="text-sm">(수강 전)</span>
                      </td>
                      <td className="border border-border px-4 py-3 text-text-secondary">
                        <strong className="text-green-600">전액 환불</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-3 text-text-secondary font-medium">
                        결제 후 7일 이내<br />
                        <span className="text-sm">(수강 시작)</span>
                      </td>
                      <td className="border border-border px-4 py-3 text-text-secondary">
                        수강한 강의 수에 비례하여 환불<br />
                        <span className="text-sm">(상세 기준 아래 참조)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-3 text-text-secondary font-medium">
                        결제 후 7일 초과
                      </td>
                      <td className="border border-border px-4 py-3 text-text-secondary">
                        수강 시작 여부와 관계없이<br />
                        수강한 강의 수에 비례하여 환불
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">2. 환불금액 계산</h2>
              <div className="bg-bg-light p-4 rounded-lg mb-4">
                <p className="text-text-primary font-medium mb-2">환불금액 = 결제금액 - (수강한 강의 수 × 강의당 금액) - 위약금</p>
                <p className="text-sm text-text-secondary">
                  * 강의당 금액 = 결제금액 ÷ 총 강의 수<br />
                  * 위약금 = 결제금액의 10% (환불 수수료)
                </p>
              </div>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">예시</h3>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>총 강의 20개, 결제금액 100,000원인 강의에서 5개 수강 후 환불 신청</li>
                <li>강의당 금액: 100,000 ÷ 20 = 5,000원</li>
                <li>수강분: 5,000 × 5 = 25,000원</li>
                <li>위약금: 100,000 × 10% = 10,000원</li>
                <li><strong>환불금액: 100,000 - 25,000 - 10,000 = 65,000원</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">3. 환불 불가 사유</h2>
              <p className="text-text-secondary mb-3">다음의 경우 환불이 불가합니다.</p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>수강률이 전체 강의의 50%를 초과한 경우</li>
                <li>수강 기간이 절반 이상 경과한 경우</li>
                <li>강의 자료를 다운로드한 경우 (해당 강의에 한함)</li>
                <li>쿠폰, 포인트 등 할인 혜택을 적용받은 경우 (할인 금액 제외 후 환불)</li>
                <li>이벤트 또는 프로모션으로 무료 제공된 강의</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">4. 환불 절차</h2>
              <ol className="list-decimal list-inside space-y-3 text-text-secondary">
                <li>
                  <strong>환불 신청</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>마이페이지 → 결제 내역 → 환불 신청</li>
                    <li>또는 고객센터를 통한 환불 요청</li>
                  </ul>
                </li>
                <li>
                  <strong>환불 심사</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>환불 가능 여부 및 환불 금액 확인</li>
                    <li>영업일 기준 1~3일 소요</li>
                  </ul>
                </li>
                <li>
                  <strong>환불 처리</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>신용카드: 결제 취소 (카드사에 따라 3~7일 소요)</li>
                    <li>계좌이체: 환불 계좌로 입금 (영업일 기준 3~5일 소요)</li>
                    <li>가상계좌: 환불 계좌로 입금</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">5. 특별 환불 규정</h2>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">서비스 장애로 인한 환불</h3>
              <p className="text-text-secondary mb-3">
                회사의 귀책사유로 인해 서비스 이용이 불가능한 경우, 해당 기간만큼 수강 기간을
                연장하거나 전액 환불을 받으실 수 있습니다.
              </p>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">콘텐츠 품질 문제</h3>
              <p className="text-text-secondary">
                강의 내용이 설명과 현저히 다르거나 중대한 오류가 있는 경우,
                결제 후 14일 이내에 환불을 요청하실 수 있습니다.
                (단, 회사의 확인 절차를 거칩니다)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">6. 유의사항</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>환불 신청 시 수강 권한이 즉시 정지됩니다.</li>
                <li>환불 완료 후에는 해당 강의를 다시 수강할 수 없습니다.</li>
                <li>부분 환불 시 사용한 쿠폰은 복구되지 않습니다.</li>
                <li>환불금액은 원래 결제 수단으로 환불됩니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">7. 문의</h2>
              <p className="text-text-secondary">
                환불 관련 문의는 <Link href="/inquiries/new" className="text-primary hover:underline">1:1 문의</Link>를
                이용해 주시기 바랍니다.
              </p>
              <div className="bg-bg-light p-4 rounded-lg mt-4">
                <p className="text-text-secondary">
                  <strong>고객센터</strong><br />
                  이메일: [이메일 주소]<br />
                  운영시간: 평일 10:00 - 18:00 (주말 및 공휴일 휴무)
                </p>
              </div>
            </section>

            <section className="pt-8 border-t border-border">
              <p className="text-text-secondary">
                <strong>부칙</strong><br />
                본 환불정책은 2024년 1월 1일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
