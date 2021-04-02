JWT Authentication

Header.Payload.Signature

Header
{
	"alg": "HS256",// Encryption algorithm
	"typ": "JWT"
} which is JSON base64URL

Payload (contains the claims)
{
	"sub":
}

Signature (created from data (header and payload) and the secret key)
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)


Whenever the user wants to access a protected route or resource, the user agent should send the JWT, typically in the Authorization header using the Bearer schema. The content of the header should look like the following:

Authorization: Bearer <token>
Example
Authorization: Bearer {}.{}




IN SERVER
	-in env:
		-secret
		-algorithm
		-issuer
		-expiry