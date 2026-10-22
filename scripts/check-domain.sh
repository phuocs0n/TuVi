#!/usr/bin/env bash
# Kiểm tra domain: DNS, HTTP(S), hạn SSL.  Dùng:  bash scripts/check-domain.sh tuviai.id.vn
set -u
DOMAIN="${1:-tuviai.id.vn}"
# Chưa có backend nên chưa kiểm tra api.$DOMAIN; khi có thì thêm "api.$DOMAIN" vào danh sách.
HOSTS=("$DOMAIN" "www.$DOMAIN")
fail=0

# dig không có sẵn ở mọi máy (vd Git Bash trên Windows) → fallback sang getent
resolve() {
  if command -v dig >/dev/null 2>&1; then
    dig +short "$1" "${2:-A}"
  else
    getent hosts "$1" | awk '{print $1}'
  fi
}

echo "== NS của $DOMAIN"
resolve "$DOMAIN" NS || true

for h in "${HOSTS[@]}"; do
  echo
  echo "===== $h ====="
  a=$(resolve "$h" A; resolve "$h" CNAME)
  if [ -z "$a" ]; then echo "[FAIL] Chưa có bản ghi A/CNAME"; fail=1; continue; fi
  echo "[ OK ] DNS:"; echo "$a" | sed 's/^/       /'

  code=$(curl -sS -m 15 -o /dev/null -L -w '%{http_code}' "https://$h/" 2>&1) || code="ERR"
  case "$code" in
    2*|3*) echo "[ OK ] HTTPS trả về $code" ;;
    *)     echo "[FAIL] HTTPS trả về: $code"; fail=1 ;;
  esac

  exp=$(echo | openssl s_client -servername "$h" -connect "$h:443" 2>/dev/null \
        | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [ -n "$exp" ]; then
    left=$(( ( $(date -d "$exp" +%s) - $(date +%s) ) / 86400 ))
    echo "[ OK ] SSL hết hạn: $exp (còn $left ngày)"
    [ "$left" -lt 14 ] && { echo "[WARN] SSL sắp hết hạn"; fail=1; }
  else
    echo "[FAIL] Không đọc được chứng chỉ SSL"; fail=1
  fi
done

exit $fail
